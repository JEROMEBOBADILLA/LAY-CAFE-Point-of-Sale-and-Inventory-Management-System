import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
// Import the idempotent schema before the demo seed. The existing
// cafe_users / cafe_orders / cafe_products tables are not dropped or rewritten.
const database = process.env.DB_NAME || 'laycafedb';
if (database !== 'laycafedb') {
  console.error(`Database mismatch: DB_NAME=${database}. This package uses laycafedb.`);
  console.error('Set DB_NAME=laycafedb in Backend/.env, then try again.');
  process.exit(1);
}
let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    multipleStatements: true,
    decimalNumbers: true,
  });
  const schema = await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8');
  // The SQL is a checked-in project file; never accept arbitrary user SQL here.
  await connection.query(schema);
  const [tables] = await connection.query(`
    SELECT TABLE_NAME AS name FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN
    ('users','products','inventory','product_inventory','sales','sale_items','inventory_movements')
  `, [database]);
  const found = new Set(tables.map((row) => row.name));
  const required = ['users', 'products', 'inventory', 'product_inventory', 'sales', 'sale_items', 'inventory_movements'];
  const missing = required.filter((name) => !found.has(name));
  if (missing.length)
    throw new Error(`Still missing tables: ${missing.join(', ')}`);
  const [columns] = await connection.query(`
    SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'inventory'
  `, [database]);
  const inventoryColumns = new Set(columns.map((row) => row.name));
  const missingColumns = ['id', 'name', 'category', 'quantity', 'unit', 'reorder_level', 'is_active', 'updated_at'].filter((x) => !inventoryColumns.has(x));
  if (missingColumns.length)
    throw new Error(`Existing inventory table is incompatible; missing columns: ${missingColumns.join(', ')}`);
  const [saleColumns] = await connection.query(`
    SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sales'
  `, [database]);
  if (!saleColumns.some((row) => row.name === 'order_type'))
    throw new Error('Missing sales.order_type. Run npm run setup to migrate schema.');
  console.log('Database ready: laycafedb (7 required tables found).');
  console.log('Existing cafe_* tables were not deleted. The inventory table is shared.');
}
catch (err) {
  console.error('\nDatabase setup failed:', err.sqlMessage || err.message);
  console.error('1. Start MySQL in XAMPP and verify Backend/.env (DB_NAME=laycafedb).');
  console.error('2. Export a backup of laycafedb before trying again.');
  console.error('3. If this mentions inventory, do NOT delete the table.');
  console.error('   In phpMyAdmin > laycafedb > SQL, run: SHOW CREATE TABLE inventory;');
  console.error('   Share the result so the existing schema can be migrated safely.');
  process.exitCode = 1;
}
finally {
  await connection?.end();
}
