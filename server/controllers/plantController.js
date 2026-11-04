import { getSupabase } from "../config/db.js";
import { getPlantSchedule, parseCalendarDate } from "../utils/dates.js";

function requestError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function plantFromRow(row) {
  return {
    _id: row.id,
    name: row.name,
    type: row.type,
    wateringInterval: row.watering_interval,
    lastWatered: row.last_watered,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function logFromRow(row) {
  return {
    _id: row.id,
    plantId: row.plant_id,
    plantName: row.plant_name,
    action: row.action,
    date: row.date
  };
}

function plantToRow(input) {
  const row = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.type !== undefined) row.type = input.type;
  if (input.wateringInterval !== undefined) row.watering_interval = input.wateringInterval;
  if (input.lastWatered !== undefined) row.last_watered = input.lastWatered.toISOString().slice(0, 10);
  if (input.notes !== undefined) row.notes = input.notes;
  return row;
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
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    throw requestError("Invalid plant id.");
  }
  return id;
}

async function findPlantOrFail(id) {
  const { data: row, error } = await getSupabase()
    .from("plants")
    .select("*")
    .eq("id", validateId(id))
    .maybeSingle();
  if (error) throw error;
  const plant = row && plantFromRow(row);
  if (!plant) throw requestError("Plant not found.", 404);
  return plant;
}

export async function createPlant(req, res) {
  const { data: row, error } = await getSupabase()
    .from("plants")
    .insert(plantToRow(validatePlantInput(req.body)))
    .select("*")
    .single();
  if (error) throw error;
  res.status(201).json({ plant: getPlantSchedule(plantFromRow(row)) });
}

export async function getPlants(req, res) {
  const { data: rows, error } = await getSupabase()
    .from("plants")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  res.json({ plants: rows.map((row) => getPlantSchedule(plantFromRow(row))) });
}

export async function getPlant(req, res) {
  res.json({ plant: getPlantSchedule(await findPlantOrFail(req.params.id)) });
}

export async function updatePlant(req, res) {
  const input = validatePlantInput(req.body, { partial: true });
  if (!Object.keys(input).length) {
    return res.status(400).json({ message: "Provide at least one plant field to update." });
  }

  const { data: row, error } = await getSupabase()
    .from("plants")
    .update({ ...plantToRow(input), updated_at: new Date().toISOString() })
    .eq("id", validateId(req.params.id))
    .select("*")
    .maybeSingle();
  if (error) throw error;
  const plant = row && plantFromRow(row);
  if (!plant) return res.status(404).json({ message: "Plant not found." });
  res.json({ plant: getPlantSchedule(plant) });
}

export async function deletePlant(req, res) {
  const { data: row, error } = await getSupabase()
    .from("plants")
    .delete()
    .eq("id", validateId(req.params.id))
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!row) throw requestError("Plant not found.", 404);
  res.json({ message: "Plant and its care history deleted." });
}

export async function waterPlant(req, res) {
  const { data, error } = await getSupabase().rpc("water_plant", {
    p_plant_id: validateId(req.params.id)
  });
  if (error) {
    if (error.code === "P0002") throw requestError("Plant not found.", 404);
    throw error;
  }

  const plant = plantFromRow(data.plant);
  const log = logFromRow(data.log);
  res.status(201).json({
    plant: getPlantSchedule(plant),
    message: "Plant marked as watered.",
    date: log.date.slice(0, 10)
  });
}

export async function getPlantLogs(req, res) {
  const plant = await findPlantOrFail(req.params.id);
  const { data: rows, error } = await getSupabase()
    .from("care_logs")
    .select("*")
    .eq("plant_id", plant._id)
    .order("date", { ascending: false });
  if (error) throw error;
  res.json({ logs: rows.map(logFromRow) });
}

export async function getAllLogs(req, res) {
  const { data: rows, error } = await getSupabase()
    .from("care_logs")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  res.json({ logs: rows.map(logFromRow) });
}

export async function getAttentionPlants(req, res) {
  const { data: rows, error } = await getSupabase().from("plants").select("*");
  if (error) throw error;
  const attention = rows
    .map((row) => getPlantSchedule(plantFromRow(row)))
    .filter((plant) => plant.status !== "Upcoming")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "Overdue" ? -1 : 1;
      return b.daysOverdue - a.daysOverdue;
    });
  res.json({ plants: attention });
}
