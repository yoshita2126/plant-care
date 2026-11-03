import mongoose from "mongoose";
import CareLog from "../models/CareLog.js";
import Plant from "../models/Plant.js";
import { calendarDay, getPlantSchedule, parseCalendarDate } from "../utils/dates.js";

function requestError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validatePlantInput(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw requestError("Request body must be a JSON object.");
  }

  const input = {};
  for (const field of ["name", "type", "wateringInterval", "lastWatered", "notes"]) {
    if (body[field] !== undefined) input[field] = body[field];
  }

  if (!partial) {
    for (const field of ["name", "type", "wateringInterval", "lastWatered"]) {
      if (input[field] === undefined || input[field] === "") {
        throw requestError(`${field} is required.`);
      }
    }
  }
  if (input.name !== undefined && (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 80)) {
    throw requestError("Plant name must contain 1 to 80 characters.");
  }
  if (input.type !== undefined && (typeof input.type !== "string" || !input.type.trim() || input.type.trim().length > 80)) {
    throw requestError("Plant type must contain 1 to 80 characters.");
  }
  if (input.wateringInterval !== undefined) {
    const interval = Number(input.wateringInterval);
    if (!Number.isInteger(interval) || interval < 1 || interval > 3650) {
      throw requestError("Watering interval must be a whole number from 1 to 3650.");
    }
    input.wateringInterval = interval;
  }
  if (input.lastWatered !== undefined) {
    const parsedDate = parseCalendarDate(input.lastWatered);
    if (!parsedDate) throw requestError("Last watered must be a valid calendar date (YYYY-MM-DD).");
    input.lastWatered = parsedDate;
  }
  if (input.notes !== undefined && (typeof input.notes !== "string" || input.notes.length > 1000)) {
    throw requestError("Notes must be text no longer than 1000 characters.");
  }

  if (input.name !== undefined) input.name = input.name.trim();
  if (input.type !== undefined) input.type = input.type.trim();
  if (input.notes !== undefined) input.notes = input.notes.trim();
  return input;
}

function validateId(id) {
  if (!/^[\da-f]{24}$/i.test(id)) throw requestError("Invalid plant id.");
  return new mongoose.Types.ObjectId(id);
}

async function findPlantOrFail(id) {
  const plant = await Plant.findById(validateId(id)).lean();
  if (!plant) throw requestError("Plant not found.", 404);
  return plant;
}

export async function createPlant(req, res) {
  const plant = await Plant.create(validatePlantInput(req.body));
  res.status(201).json({ plant: getPlantSchedule(plant) });
}

export async function getPlants(req, res) {
  const plants = await Plant.find().sort({ createdAt: -1 }).lean();
  res.json({ plants: plants.map((plant) => getPlantSchedule(plant)) });
}

export async function getPlant(req, res) {
  res.json({ plant: getPlantSchedule(await findPlantOrFail(req.params.id)) });
}

export async function updatePlant(req, res) {
  const input = validatePlantInput(req.body, { partial: true });
  if (!Object.keys(input).length) {
    return res.status(400).json({ message: "Provide at least one plant field to update." });
  }

  const plant = await Plant.findByIdAndUpdate(
    validateId(req.params.id),
    { $set: input },
    { new: true, runValidators: true }
  ).lean();
  if (!plant) return res.status(404).json({ message: "Plant not found." });
  res.json({ plant: getPlantSchedule(plant) });
}

export async function deletePlant(req, res) {
  const plantId = validateId(req.params.id);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const deleted = await Plant.findByIdAndDelete(plantId, { session });
      if (!deleted) throw requestError("Plant not found.", 404);
      await CareLog.deleteMany({ plantId }, { session });
    });
  } finally {
    await session.endSession();
  }
  res.json({ message: "Plant and its care history deleted." });
}

export async function waterPlant(req, res) {
  const plantId = validateId(req.params.id);
  const session = await mongoose.startSession();
  let plant;
  let log;
  try {
    await session.withTransaction(async () => {
      plant = await Plant.findByIdAndUpdate(
        plantId,
        { $set: { lastWatered: calendarDay() } },
        { new: true, runValidators: true, session }
      ).lean();
      if (!plant) throw requestError("Plant not found.", 404);
      [log] = await CareLog.create([{
        plantId: plant._id,
        plantName: plant.name,
        action: "watered"
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json({
    plant: getPlantSchedule(plant),
    message: "Plant marked as watered.",
    date: log.date.toISOString().slice(0, 10)
  });
}

export async function getPlantLogs(req, res) {
  const plant = await findPlantOrFail(req.params.id);
  const logs = await CareLog.find({ plantId: plant._id }).sort({ date: -1 }).lean();
  res.json({ logs });
}

export async function getAllLogs(req, res) {
  const logs = await CareLog.find().sort({ date: -1 }).lean();
  res.json({ logs });
}

export async function getAttentionPlants(req, res) {
  const plants = await Plant.find().lean();
  const attention = plants
    .map((plant) => getPlantSchedule(plant))
    .filter((plant) => plant.status !== "Upcoming")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "Overdue" ? -1 : 1;
      return b.daysOverdue - a.daysOverdue;
    });
  res.json({ plants: attention });
}
