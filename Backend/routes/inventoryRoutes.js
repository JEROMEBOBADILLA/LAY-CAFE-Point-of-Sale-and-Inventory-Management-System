import { Router } from "express";
import * as c from "../controllers/inventoryController.js";

const router = Router();

router.get("/", c.list);
router.get("/:id", c.get);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

export default router;