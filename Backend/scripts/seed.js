import 'dotenv/config';
import db from '../config/db.js';
import { hashPassword, verifyPassword } from '../middleware/auth.js';
import { PRODUCTS } from '../data/menu.js';
// Local DEMO accounts. Migrate the previous "!" passwords only when they
// are still the original seed passwords; never overwrite custom passwords.
const demoPasswords = {
  admin: { old: 'Admin123!', next: 'Admin123', env: 'SEED_ADMIN_PASSWORD' },
  cashier: { old: 'Cashier123!', next: 'Cashier123', env: 'SEED_CASHIER_PASSWORD' },
  kitchen: { old: 'Kitchen123!', next: 'Kitchen123', env: 'SEED_KITCHEN_PASSWORD' },
};
const users = [
  ['admin', 'LayCafe Administrator', 'admin'],
  ['cashier', 'LayCafe Cashier', 'cashier'],
  ['kitchen', 'LayCafe Kitchen', 'kitchen'],
];
function chosenDemoPassword(username) {
  const cfg = demoPasswords[username];
  const envValue = process.env[cfg.env];
  // Upgrade the old sample environment file without requiring .env deletion.
  return !envValue || envValue === cfg.old ? cfg.next : envValue;
}
const ingredients = [
  ['Coffee base', 'Ingredient', 90, 'serving', 15], ['Matcha base', 'Ingredient', 65, 'serving', 12],
  ['Tea & ade base', 'Ingredient', 80, 'serving', 12], ['Smoothie base', 'Ingredient', 75, 'serving', 12],
  ['Pasta & noodles base', 'Ingredient', 60, 'serving', 10], ['Bread & sandwich base', 'Ingredient', 65, 'serving', 10],
  ['Rice meals base', 'Ingredient', 70, 'serving', 10], ['Snack base', 'Ingredient', 65, 'serving', 10],
  ['Pastry & waffle base', 'Ingredient', 60, 'serving', 10], ['Add-on base', 'Supply', 80, 'serving', 10],
];
const mapping = {
  'Iced Coffee': 'Coffee base',
  'Kyoto Matcha': 'Matcha base',
  'Ade, Tea & Latte': 'Tea & ade base',
  'Smoothie': 'Smoothie base',
  'Pasta & Noodles': 'Pasta & noodles base',
  'Bread': 'Bread & sandwich base',
  'Rice': 'Rice meals base',
  'Snacks & Appetizers': 'Snack base',
  'Pastries & Waffles': 'Pastry & waffle base',
  'Add-ons': 'Add-on base'
};
try {
  let updatedDemoPasswords = 0;
  for (const [username, full, role] of users) {
    const password = chosenDemoPassword(username);
    const [existing] = await db.query('SELECT id,password_hash FROM users WHERE username=?', [username]);
    if (!existing.length) {
      await db.query('INSERT INTO users (username,full_name,role,password_hash) VALUES (?,?,?,?)', [username, full, role, hashPassword(password)]);
    }
    else if (password === demoPasswords[username].next && verifyPassword(demoPasswords[username].old, existing[0].password_hash)) {
      await db.query('UPDATE users SET password_hash=? WHERE id=?', [hashPassword(password), existing[0].id]);
      updatedDemoPasswords++;
    }
  }
  for (const [name, category, quantity, unit, level] of ingredients) {
    const [existing] = await db.query('SELECT id FROM inventory WHERE name=?', [name]);
    if (!existing.length) {
      const [created] = await db.query(
        'INSERT INTO inventory (name,category,quantity,unit,reorder_level) VALUES (?,?,?,?,?)',
        [name, category, quantity, unit, level]
      );
      await db.query(
        "INSERT INTO inventory_movements (inventory_id,movement_type,quantity_change,note) VALUES (?,'initial',?,'Demo starting stock')",
        [created.insertId, quantity]
      );
    }
  }
  const [stocks] = await db.query('SELECT id,name FROM inventory');
  const stockIds = new Map(stocks.map(s => [s.name, s.id]));
  for (const p of PRODUCTS) {
    await db.query('INSERT IGNORE INTO products (name,category,price) VALUES (?,?,?)', [p.name, p.category, p.price]);
    const [[created]] = await db.query('SELECT id FROM products WHERE name=? AND category=?', [p.name, p.category]);
    const ingredientId = stockIds.get(mapping[p.category]);
    if (ingredientId)
      await db.query('INSERT IGNORE INTO product_inventory (product_id,inventory_id,quantity_required) VALUES (?,?,1)', [created.id, ingredientId]);
  }
  console.log(`Seed complete: ${PRODUCTS.length} menu products, ${ingredients.length} starter inventory items, and 3 development users.`);
  console.log(`Demo passwords updated from old defaults: ${updatedDemoPasswords}. Existing custom passwords were preserved.`);
  console.log('Local demo logins: admin / Admin123, cashier / Cashier123, kitchen / Kitchen123 (unless customized).');
  console.log('Starter recipes are DEMO mappings, not actual ingredient consumption. Set precise recipes in Admin > Menu & recipes before production.');
}
catch (err) {
  console.error('Seed failed. Import Backend/sql/schema.sql and start MySQL in XAMPP first.');
  console.error(err);
  process.exitCode = 1;
}
finally {
  await db.end();
}
