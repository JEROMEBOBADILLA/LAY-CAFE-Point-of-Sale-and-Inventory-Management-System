import * as service from "../services/inventoryService.js";
import handleError from "../utils/handleError.js";
export const list = async (req, res) => {
  try {
    res.json(await service.getAll());
  }
  catch (e) {
    handleError(res, e);
  }
};
export const get = async (req, res) => {
  try {
    res.json(await service.getOne(req.params.id));
  }
  catch (e) {
    handleError(res, e);
  }
};
export const create = async (req, res) => {
  try {
    res.status(201).json(await service.add(req.body));
  }
  catch (e) {
    handleError(res, e);
  }
};
export const update = async (req, res) => {
  try {
    res.json(await service.update(req.params.id, req.body));
  }
  catch (e) {
    handleError(res, e);
  }
};
export const remove = async (req, res) => {
  try {
    await service.remove(req.params.id);
    res.status(204).end();
  }
  catch (e) {
    handleError(res, e);
  }
};
