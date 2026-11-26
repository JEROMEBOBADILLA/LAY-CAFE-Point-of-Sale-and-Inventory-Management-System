import { Router } from 'express';
import * as c from '../controllers/inventoryController.js';
import db from '../config/db.js';
import ValidationError from '../utils/ValidationError.js';
const router = Router();
router.get('/', c.list);
router.get('/movements/recent', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT m.id, m.inventory_id AS inventoryId, i.name AS itemName, m.sale_id AS saleId, m.movement_type AS type, m.quantity_change AS changeAmount, i.unit, m.note, m.created_at AS createdAt FROM inventory_movements m JOIN inventory i ON i.id=m.inventory_id ORDER BY m.created_at DESC, m.id DESC LIMIT 100');
    res.json(rows);
  }
  catch (e) {
    next(e);
  }
});
router.post('/:id/movements', async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const type = String(req.body?.type || '');
    const amount = Number(req.body?.amount);
    const note = String(req.body?.note || '').trim().slice(0, 255);
    if (!['restock', 'adjustment'].includes(type) || !Number.isFinite(amount) || Math.abs(amount) < 0.001 || Math.abs(amount) > 1000000 || Math.abs(Math.round(amount * 1000) - amount * 1000) > 0.000001)
      throw new ValidationError(400, 'Enter a valid signed movement (up to 3 decimals).');
    if (type === 'restock' && amount < 0)
      throw new ValidationError(400, 'Restock amount must be positive.');
    await conn.beginTransaction();
    const [[item]] = await conn.query('SELECT quantity FROM inventory WHERE id=? AND is_active=1 FOR UPDATE', [req.params.id]);
    if (!item)
      throw new ValidationError(404, 'Inventory item not found.');
    if (Number(item.quantity) + amount < 0)
      throw new ValidationError(409, 'Not enough stock for this deduction.');
    await conn.query('UPDATE inventory SET quantity=quantity+? WHERE id=?', [amount, req.params.id]);
    await conn.query(
      'INSERT INTO inventory_movements (inventory_id,movement_type,quantity_change,note) VALUES (?,?,?,?)',
      [req.params.id, type, amount, note || 'Manual stock movement']
    );
    await conn.commit();
    const [[updated]] = await conn.query('SELECT id,name,category,quantity,unit,reorder_level AS reorderLevel FROM inventory WHERE id=?', [req.params.id]);
    res.json(updated);
  }
  catch (e) {
    await conn.rollback();
    next(e);
  }
  finally {
    conn.release();
  }
});
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
