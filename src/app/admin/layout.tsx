import { requireAdminAccess } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminAccess();
  return children;
}
