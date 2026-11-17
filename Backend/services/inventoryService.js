import * as model from "../models/inventoryModel.js";
import ValidationError from "../utils/ValidationError.js";

const CATEGORIES = ["Ingredient", "Supply"];

function clean(input = {}) {
  const name = String(input.name || "").trim();
  const unit = String(input.unit || "").trim();
  const category = input.category;
  const quantity = Number(input.quantity);
  const reorderLevel = Number(input.reorderLevel === "" ? 0 : input.reorderLevel ?? 0);

  if (!name) throw new ValidationError(400, "Enter the item name.");
  if (!CATEGORIES.includes(category))
    throw new ValidationError(400, "Choose Ingredient or Supply as the category.");
  if (input.quantity === "" || !Number.isFinite(quantity) || quantity < 0)
    throw new ValidationError(400, "Quantity must be 0 or more.");
  if (!unit) throw new ValidationError(400, "Enter the unit, such as kg, L, or pcs.");
  if (!Number.isFinite(reorderLevel) || reorderLevel < 0)
    throw new ValidationError(400, "Reorder level must be 0 or more.");

  return { name, category, quantity, unit, reorderLevel };
}

const getAll = () => model.findAll();

async function getOne(id) {
  const item = await model.findById(id);
  if (!item) throw new ValidationError(404, "Inventory item not found.");
  return item;
}

const add = (input) => model.create(clean(input));

async function update(id, input) {
  const item = await model.update(id, clean(input));
  if (!item) throw new ValidationError(404, "Inventory item not found.");
  return item;
}

async function remove(id) {
  if (!(await model.remove(id))) throw new ValidationError(404, "Inventory item not found.");
}

export { getAll, getOne, add, update, remove };