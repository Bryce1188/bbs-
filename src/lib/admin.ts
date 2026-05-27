import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export async function requireAdminAccess() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/admin");
  }

  if (!["admin", "moderator"].includes(user.role)) {
    redirect("/");
  }

  return user;
}
