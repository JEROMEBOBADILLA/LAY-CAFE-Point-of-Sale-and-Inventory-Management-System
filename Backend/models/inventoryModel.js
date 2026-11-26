import db from '../config/db.js';
const cols = 'id,name,category,quantity,unit,reorder_level AS reorderLevel,updated_at AS updatedAt';
export async function findAll() {
  const [rows] = await db.query(`SELECT ${cols} FROM inventory WHERE is_active=1 ORDER BY name`);
  return rows;
}
export async function findById(id) {
  const [[r]] = await db.query(`SELECT ${cols} FROM inventory WHERE id=? AND is_active=1`, [id]);
  return r || null;
}
export async function create(v) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO inventory (name,category,quantity,unit,reorder_level) VALUES (?,?,?,?,?)',
      [v.name, v.category, v.quantity, v.unit, v.reorderLevel]
    );
    if (v.quantity > 0)
      await conn.query(
        "INSERT INTO inventory_movements (inventory_id,movement_type,quantity_change,note) VALUES (?,'initial',?,'Starting stock')",
        [result.insertId, v.quantity]
      );
    await conn.commit();
    return findById(result.insertId);
  }
  catch (e) {
    await conn.rollback();
    throw e;
  }
  finally {
    conn.release();
  }
}
export async function update(id, v) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[old]] = await conn.query('SELECT quantity FROM inventory WHERE id=? AND is_active=1 FOR UPDATE', [id]);
    if (!old) {
      await conn.rollback();
      return null;
    }
    const [result] = await conn.query(
      'UPDATE inventory SET name=?,category=?,quantity=?,unit=?,reorder_level=? WHERE id=?',
      [v.name, v.category, v.quantity, v.unit, v.reorderLevel, id]
    );
    const diff = Math.round((v.quantity - Number(old.quantity)) * 1000) / 1000;
    if (diff)
      await conn.query(
        "INSERT INTO inventory_movements (inventory_id,movement_type,quantity_change,note) VALUES (?,'adjustment',?,'Quantity changed in item editor')",
        [id, diff]
      );
    await conn.commit();
    return result.affectedRows ? findById(id) : null;
  }
  catch (e) {
    await conn.rollback();
    throw e;
  }
  finally {
    conn.release();
  }
}
export async function remove(id) {
  const [result] = await db.query('UPDATE inventory SET is_active=0 WHERE id=? AND is_active=1', [id]);
  return result.affectedRows > 0;
}
