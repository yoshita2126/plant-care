import { createClient } from "@supabase/supabase-js";

export let supabase;

export async function connectDatabase() {
  const projectUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!projectUrl || !publishableKey) {
    throw new Error("Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in server/.env.");
  }

  supabase = createClient(projectUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error } = await supabase
    .from("plants")
    .select("id,name,type,watering_interval,last_watered,notes,created_at,updated_at")
    .limit(1);
  if (error) {
    throw new Error(`Supabase is not ready: ${error.message}. Apply server/supabase-schema.sql in the Supabase SQL Editor.`);
  }

  console.log("Supabase connected: plant-care tables are available.");
}
