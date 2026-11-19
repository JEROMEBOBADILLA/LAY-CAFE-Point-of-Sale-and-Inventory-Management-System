import db from "../config/db.js";

// Isang transaction: sales + sale_items. Kapag may pumalya, rollback lahat.
async function create({ items, total, payment, change }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [sale] = await conn.query(
      "INSERT INTO sales (total_amount, payment, change_amount) VALUES (?, ?, ?)",
      [total, payment, change]
    );

    const rows = items.map((i) => [sale.insertId, i.productId, i.quantity, i.unitPrice, i.subtotal]);
    await conn.query(
      "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES ?",
      [rows]
    );

    await conn.commit();
    return sale.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function findById(id) {
  const [sales] = await db.query(
    `SELECT id, total_amount AS total, payment, change_amount AS \`change\`, created_at AS createdAt
     FROM sales WHERE id = ?`,
    [id]
  );
  if (!sales[0]) return null;

  const [items] = await db.query(
    `SELECT si.product_id AS productId, p.name, si.quantity,
            si.unit_price AS unitPrice, si.subtotal
     FROM sale_items si JOIN products p ON p.id = si.product_id
     WHERE si.sale_id = ? ORDER BY si.id ASC`,
    [id]
  );

  const s = sales[0];
  return {
    id: s.id,
    createdAt: s.createdAt,
    total: Number(s.total),
    payment: Number(s.payment),
    change: Number(s.change),
    items: items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
    })),
  };
}

// date format: YYYY-MM-DD. Kung walang binigay, pinakabagong 100 sales.
async function findAll({ from, to } = {}) {
  let sql = `SELECT id, total_amount AS total, payment, change_amount AS \`change\`, created_at AS createdAt FROM sales`;
  const params = [];
  if (from && to) {
    sql += " WHERE DATE(created_at) BETWEEN ? AND ?";
    params.push(from, to);
  }
  sql += " ORDER BY created_at DESC, id DESC LIMIT 100";
  const [rows] = await db.query(sql, params);
  return rows.map((r) => ({
    ...r,
    total: Number(r.total),
    payment: Number(r.payment),
    change: Number(r.change),
  }));
}

async function todaySummary() {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS transactions, COALESCE(SUM(total_amount), 0) AS totalSales
     FROM sales WHERE DATE(created_at) = CURDATE()`
  );
  return {
    transactions: Number(rows[0].transactions),
    totalSales: Number(rows[0].totalSales),
  };
}

export { create, findById, findAll, todaySummary };
