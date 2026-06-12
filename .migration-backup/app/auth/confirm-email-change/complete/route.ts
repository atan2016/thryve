import { NextResponse } from "next/server";

import { consumePendingUserEmailChange } from "@/lib/persistence";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.redirect(new URL("/auth/confirm-email-change?state=invalid", requestUrl));
  }

  const result = await consumePendingUserEmailChange(token);
  const query = new URLSearchParams();
  query.set("state", result.status);

  if ("message" in result) {
    query.set("message", result.message);
  }

  if (result.status === "success") {
    query.set("email", result.email);
  }

  return NextResponse.redirect(new URL(`/auth/confirm-email-change?${query.toString()}`, requestUrl));
}
