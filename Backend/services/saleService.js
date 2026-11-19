import * as sales from "../models/saleModel.js";
import * as products from "../models/productModel.js";
import ValidationError from "../utils/ValidationError.js";

const toCents = (n) => Math.round(n * 100);
const fromCents = (c) => c / 100;

// Body: { items: [{ productId, quantity }], payment }
// Ang presyo ay galing sa database, hindi sa client, para hindi mapeke.
async function checkout(input = {}) {
  if (!Array.isArray(input.items) || input.items.length === 0)
    throw new ValidationError(400, "Add at least one item to the order.");

  // pagsamahin kung may doble na productId
  const qtyById = new Map();
  for (const raw of input.items) {
    const productId = Number(raw?.productId);
    const quantity = Number(raw?.quantity);
    if (!Number.isInteger(productId) || productId <= 0)
      throw new ValidationError(400, "Invalid product in the order.");
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 1000)
      throw new ValidationError(400, "Quantity must be a whole number from 1 to 1000.");
    qtyById.set(productId, (qtyById.get(productId) || 0) + quantity);
  }

  const found = await products.findActiveByIds([...qtyById.keys()]);
  if (found.length !== qtyById.size)
    throw new ValidationError(400, "One or more products are not available.");

  let totalCents = 0;
  const items = found.map((p) => {
    const quantity = qtyById.get(p.id);
    const subtotalCents = toCents(p.price) * quantity;
    totalCents += subtotalCents;
    return {
      productId: p.id,
      name: p.name,
      quantity,
      unitPrice: p.price,
      subtotal: fromCents(subtotalCents),
    };
  });

  const payment = Number(input.payment);
  if (input.payment === "" || input.payment === undefined || !Number.isFinite(payment) || payment < 0)
    throw new ValidationError(400, "Enter a valid payment amount.");
  const paymentCents = toCents(payment);
  if (paymentCents < totalCents) throw new ValidationError(400, "Payment is not enough.");

  const total = fromCents(totalCents);
  const change = fromCents(paymentCents - totalCents);

  const id = await sales.create({ items, total, payment: fromCents(paymentCents), change });
  return sales.findById(id); // resibo
}

async function getOne(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new ValidationError(400, "Invalid sale id.");
  const sale = await sales.findById(n);
  if (!sale) throw new ValidationError(404, "Sale not found.");
  return sale;
}

function getAll({ from, to } = {}) {
  const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
  if ((from || to) && !(isDate(from) && isDate(to)))
    throw new ValidationError(400, "Use ?from=YYYY-MM-DD&to=YYYY-MM-DD.");
  return sales.findAll({ from, to });
}

const getTodaySummary = () => sales.todaySummary();

export { checkout, getOne, getAll, getTodaySummary };