// Legacy compatibility stub.
// The project has migrated to MySQL + Session and no longer uses Supabase runtime clients.
export function isSupabaseConfigured() {
  return false;
}

export async function getSupabaseServerClient() {
  return null;
}

export function getSupabaseServiceClient() {
  return null;
}

export function getSupabaseUntypedServiceClient() {
  return null;
}
