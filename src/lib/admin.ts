import { redirect } from "next/navigation";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export function isAdminDemoMode() {
  return process.env.ADMIN_DEMO_MODE === "true";
}

export async function requireAdminAccess() {
  if (!isSupabaseConfigured()) {
    if (isAdminDemoMode()) return;
    redirect("/auth?next=/admin&error=admin_requires_supabase");
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/auth?next=/admin");

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?next=/admin");
  }

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (error || !profile || !["admin", "moderator"].includes(profile.role)) {
    redirect("/");
  }
}
