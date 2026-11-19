import { Router } from "express";
import * as c from "../controllers/saleController.js";

const router = Router();

router.post("/", c.checkout);
router.get("/", c.list);
router.get("/summary/today", c.summary); // dapat nasa ibabaw ng "/:id"
router.get("/:id", c.get);

export default router;
