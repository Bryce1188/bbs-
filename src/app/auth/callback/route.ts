import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const token = requestUrl.searchParams.get("token");

  if (token && next.startsWith("/auth/reset")) {
    return NextResponse.redirect(new URL(`/auth/reset?token=${encodeURIComponent(token)}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
