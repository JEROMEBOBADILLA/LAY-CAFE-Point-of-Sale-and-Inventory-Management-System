import db from "../config/db.js";

const COLUMNS =
  "id, name, category, quantity, unit, reorder_level AS reorderLevel, updated_at AS updatedAt";

async function findAll() {
  const [rows] = await db.query(`SELECT ${COLUMNS} FROM inventory ORDER BY name ASC`);
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(`SELECT ${COLUMNS} FROM inventory WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function create({ name, category, quantity, unit, reorderLevel }) {
  const [result] = await db.query(
    "INSERT INTO inventory (name, category, quantity, unit, reorder_level) VALUES (?, ?, ?, ?, ?)",
    [name, category, quantity, unit, reorderLevel]
  );
  return findById(result.insertId);
}

async function update(id, { name, category, quantity, unit, reorderLevel }) {
  const [result] = await db.query(
    "UPDATE inventory SET name = ?, category = ?, quantity = ?, unit = ?, reorder_level = ? WHERE id = ?",
    [name, category, quantity, unit, reorderLevel, id]
  );
  return result.affectedRows ? findById(id) : null;
}

async function remove(id) {
  const [result] = await db.query("DELETE FROM inventory WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export { findAll, findById, create, update, remove };