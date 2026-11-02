import { supabase } from "../config/db.js";
import { calendarDay, getPlantSchedule, parseCalendarDate } from "../utils/dates.js";

const plantColumns = "id,name,type,watering_interval,last_watered,notes,created_at,updated_at";
const logColumns = "id,plant_id,plant_name,action,date";

function mapPlant(row) {
  return {
    _id: row.id,
    name: row.name,
    type: row.type,
    wateringInterval: row.watering_interval,
    lastWatered: row.last_watered,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLog(row) {
  return {
    _id: row.id,
    plantId: row.plant_id,
    plantName: row.plant_name,
    action: row.action,
    date: row.date
  };
}

function databaseError(error) {
  const mapped = new Error(error.message || "Supabase request failed.");
  mapped.code = error.code;
  mapped.status = ["22P02", "23503", "23514"].includes(error.code) ? 400 : error.code === "42501" ? 403 : 500;
  throw mapped;
}

function validatePlantInput(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new Error("Request body must be a JSON object.");
    error.status = 400;
    throw error;
  }

  const input = {};
  for (const field of ["name", "type", "wateringInterval", "lastWatered", "notes"]) {
    if (body[field] !== undefined) input[field] = body[field];
  }

  if (!partial) {
    for (const field of ["name", "type", "wateringInterval", "lastWatered"]) {
      if (input[field] === undefined || input[field] === "") {
        const error = new Error(`${field} is required.`);
        error.status = 400;
        throw error;
      }
    }
  }
  if (input.name !== undefined && (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 80)) {
    const error = new Error("Plant name must contain 1 to 80 characters.");
    error.status = 400;
    throw error;
  }
  if (input.type !== undefined && (typeof input.type !== "string" || !input.type.trim() || input.type.trim().length > 80)) {
    const error = new Error("Plant type must contain 1 to 80 characters.");
    error.status = 400;
    throw error;
  }
  if (input.wateringInterval !== undefined) {
    const interval = Number(input.wateringInterval);
    if (!Number.isInteger(interval) || interval < 1 || interval > 3650) {
      const error = new Error("Watering interval must be a whole number from 1 to 3650.");
      error.status = 400;
      throw error;
    }
    input.wateringInterval = interval;
  }
  if (input.lastWatered !== undefined) {
    const parsedDate = parseCalendarDate(input.lastWatered);
    if (!parsedDate) {
      const error = new Error("Last watered must be a valid calendar date (YYYY-MM-DD).");
      error.status = 400;
      throw error;
    }
    input.lastWatered = parsedDate.toISOString().slice(0, 10);
  }
  if (input.notes !== undefined && (typeof input.notes !== "string" || input.notes.length > 1000)) {
    const error = new Error("Notes must be text no longer than 1000 characters.");
    error.status = 400;
    throw error;
  }

  const row = {};
  if (input.name !== undefined) row.name = input.name.trim();
  if (input.type !== undefined) row.type = input.type.trim();
  if (input.wateringInterval !== undefined) row.watering_interval = input.wateringInterval;
  if (input.lastWatered !== undefined) row.last_watered = input.lastWatered;
  if (input.notes !== undefined) row.notes = input.notes.trim();
  return row;
}

function validateId(id) {
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    const error = new Error("Invalid plant id.");
    error.status = 400;
    throw error;
  }
}

async function findPlantOrFail(id) {
  validateId(id);
  const { data, error } = await supabase.from("plants").select(plantColumns).eq("id", id).maybeSingle();
  if (error) databaseError(error);
  if (!data) {
    const error = new Error("Plant not found.");
    error.status = 404;
    throw error;
  }
  return mapPlant(data);
}

export async function createPlant(req, res) {
  const { data, error } = await supabase.from("plants").insert(validatePlantInput(req.body)).select(plantColumns).single();
  if (error) databaseError(error);
  res.status(201).json({ plant: getPlantSchedule(mapPlant(data)) });
}

export async function getPlants(req, res) {
  const { data, error } = await supabase.from("plants").select(plantColumns).order("created_at", { ascending: false });
  if (error) databaseError(error);
  res.json({ plants: data.map((plant) => getPlantSchedule(mapPlant(plant))) });
}

export async function getPlant(req, res) {
  res.json({ plant: getPlantSchedule(await findPlantOrFail(req.params.id)) });
}

export async function updatePlant(req, res) {
  const input = validatePlantInput(req.body, { partial: true });
  if (!Object.keys(input).length) {
    return res.status(400).json({ message: "Provide at least one plant field to update." });
  }

  validateId(req.params.id);
  const { data, error } = await supabase.from("plants").update(input).eq("id", req.params.id).select(plantColumns).maybeSingle();
  if (error) databaseError(error);
  if (!data) return res.status(404).json({ message: "Plant not found." });
  res.json({ plant: getPlantSchedule(mapPlant(data)) });
}

export async function deletePlant(req, res) {
  validateId(req.params.id);
  const { data, error } = await supabase.from("plants").delete().eq("id", req.params.id).select("id").maybeSingle();
  if (error) databaseError(error);
  if (!data) return res.status(404).json({ message: "Plant not found." });
  res.json({ message: "Plant and its care history deleted." });
}

export async function waterPlant(req, res) {
  validateId(req.params.id);
  const { data, error } = await supabase.rpc("water_plant", { plant_uuid: req.params.id });
  if (error) databaseError(error);
  if (!data?.length) return res.status(404).json({ message: "Plant not found." });
  res.status(201).json({
    plant: getPlantSchedule(mapPlant(data[0])),
    message: "Plant marked as watered.",
    date: calendarDay().toISOString().slice(0, 10)
  });
}

export async function getPlantLogs(req, res) {
  const plant = await findPlantOrFail(req.params.id);
  const { data, error } = await supabase.from("care_logs").select(logColumns).eq("plant_id", plant._id).order("date", { ascending: false });
  if (error) databaseError(error);
  res.json({ logs: data.map(mapLog) });
}

export async function getAllLogs(req, res) {
  const { data, error } = await supabase.from("care_logs").select(logColumns).order("date", { ascending: false });
  if (error) databaseError(error);
  res.json({ logs: data.map(mapLog) });
}

export async function getAttentionPlants(req, res) {
  const { data, error } = await supabase.from("plants").select(plantColumns);
  if (error) databaseError(error);
  const attention = data
    .map((plant) => getPlantSchedule(mapPlant(plant)))
    .filter((plant) => plant.status !== "Upcoming")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "Overdue" ? -1 : 1;
      return b.daysOverdue - a.daysOverdue;
    });
  res.json({ plants: attention });
}
