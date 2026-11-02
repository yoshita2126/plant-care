import { Router } from "express";
import { getAllLogs } from "../controllers/plantController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(getAllLogs));

export default router;
