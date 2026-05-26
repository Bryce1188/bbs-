import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createLocalReply } from "@/lib/local-db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  const path = `/posts/${id}`;
  const formData = await request.formData();
  const content = text(formData.get("content"));

  if (!Number.isInteger(postId) || postId <= 0 || content.length < 2 || content.length > 4000) {
    return NextResponse.redirect(new URL(`${path}?error=invalid_reply`, request.url), 303);
  }

  if (isSupabaseConfigured()) {
    return NextResponse.redirect(new URL(`${path}?error=supabase_reply_unavailable`, request.url), 303);
  }

  const ok = await createLocalReply(postId, content);
  if (!ok) {
    return NextResponse.redirect(new URL(`/auth?next=${encodeURIComponent(path)}`, request.url), 303);
  }

  revalidatePath(path);
  return NextResponse.redirect(new URL(`${path}?notice=reply_created`, request.url), 303);
}
