export function parseCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

export function calendarDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getPlantSchedule(plant, today = calendarDay()) {
  const lastWatered = calendarDay(new Date(plant.lastWatered));
  const nextWatering = new Date(lastWatered);
  nextWatering.setUTCDate(nextWatering.getUTCDate() + plant.wateringInterval);
  const diffDays = Math.round((nextWatering - today) / 86_400_000);
  const status = diffDays < 0 ? "Overdue" : diffDays === 0 ? "Due Today" : "Upcoming";
  const plainPlant = typeof plant.toObject === "function" ? plant.toObject() : plant;

  return {
    ...plainPlant,
    nextWatering,
    status,
    daysOverdue: Math.max(0, -diffDays)
  };
}
