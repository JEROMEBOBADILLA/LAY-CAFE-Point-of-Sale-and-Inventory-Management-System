import * as service from "../services/inventoryService.js";
import ValidationError from "../utils/ValidationError.js";

function handleError(res, err) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: "Server error. Try again." });
}

export const list = async (req, res) => {
  try { res.json(await service.getAll()); } catch (e) { handleError(res, e); }
};

export const get = async (req, res) => {
  try { res.json(await service.getOne(req.params.id)); } catch (e) { handleError(res, e); 
    
  }
};

export const create = async (req, res) => {
  try { res.status(201).json(await service.add(req.body)); } catch (e) { handleError(res, e); }
};

export const update = async (req, res) => {
  try { res.json(await service.update(req.params.id, req.body)); } catch (e) { handleError(res, e); }
};

export const remove = async (req, res) => {
  try { await service.remove(req.params.id); res.status(204).end(); } catch (e) { handleError(res, e); }
};