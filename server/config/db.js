import { createClient } from "@supabase/supabase-js";

let supabase;

export function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secretKey) {
      throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in server/.env.");
    }

    supabase = createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabase;
}

export async function connectDatabase() {
  const client = getSupabase();
  const checks = await Promise.all([
    client.from("plants").select("id", { head: true, count: "exact" }),
    client.from("care_logs").select("id", { head: true, count: "exact" })
  ]);
  const failedCheck = checks.find(({ error }) => error);
  if (failedCheck) {
    throw new Error(`Unable to connect to Supabase or access the required tables: ${failedCheck.error.message}`);
  }

  console.log("Supabase connected.");
}
