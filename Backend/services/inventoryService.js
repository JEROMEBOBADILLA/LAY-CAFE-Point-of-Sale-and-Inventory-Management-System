import * as model from "../models/inventoryModel.js";
import ValidationError from "../utils/ValidationError.js";
import db from "../config/db.js";
const CATEGORIES = ["Ingredient", "Supply"];
function clean(input = {}) {
  const name = String(input.name || "").trim();
  const unit = String(input.unit || "").trim();
  const category = input.category;
  const quantity = Number(input.quantity);
  const reorderLevel = Number(input.reorderLevel === "" ? 0 : input.reorderLevel ?? 0);
  if (!name || name.length > 160)
    throw new ValidationError(400, "Enter the item name.");
  if (!CATEGORIES.includes(category))
    throw new ValidationError(400, "Choose Ingredient or Supply as the category.");
  if (input.quantity === "" || !Number.isFinite(quantity) || quantity < 0 || quantity > 999999999 || Math.abs(Math.round(quantity * 1000) - quantity * 1000) > 0.000001)
    throw new ValidationError(400, "Quantity must be 0 or more.");
  if (!unit || unit.length > 24)
    throw new ValidationError(400, "Enter the unit, such as kg, L, or pcs.");
  if (!Number.isFinite(reorderLevel) || reorderLevel < 0 || reorderLevel > 999999999 || Math.abs(Math.round(reorderLevel * 1000) - reorderLevel * 1000) > 0.000001)
    throw new ValidationError(400, "Reorder level must be 0 or more.");
  return { name, category, quantity, unit, reorderLevel };
}
const getAll = () => model.findAll();
async function getOne(id) {
  const item = await model.findById(id);
  if (!item)
    throw new ValidationError(404, "Inventory item not found.");
  return item;
}
const add = (input) => model.create(clean(input));
async function update(id, input) {
  const item = await model.update(id, clean(input));
  if (!item)
    throw new ValidationError(404, "Inventory item not found.");
  return item;
}
async function remove(id) {
  const [linked] = await db.query('SELECT product_id FROM product_inventory WHERE inventory_id=? LIMIT 1', [id]);
  if (linked.length)
    throw new ValidationError(409, 'Remove this ingredient from product recipes before deleting it.');
  if (!(await model.remove(id)))
    throw new ValidationError(404, 'Inventory item not found.');
}
export { getAll, getOne, add, update, remove };
