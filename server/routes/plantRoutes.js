import { Router } from "express";
import {
  createPlant,
  deletePlant,
  getAttentionPlants,
  getPlant,
  getPlantLogs,
  getPlants,
  updatePlant,
  waterPlant
} from "../controllers/plantController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(createPlant));
router.get("/", asyncHandler(getPlants));
router.get("/attention", asyncHandler(getAttentionPlants));
router.get("/:id", asyncHandler(getPlant));
router.put("/:id", asyncHandler(updatePlant));
router.delete("/:id", asyncHandler(deletePlant));
router.post("/:id/water", asyncHandler(waterPlant));
router.get("/:id/logs", asyncHandler(getPlantLogs));

export default router;
