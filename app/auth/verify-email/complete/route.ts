import { NextResponse } from "next/server";

import { consumePendingSignupVerification } from "@/lib/auth/sign-up-verification";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.redirect(new URL("/auth/verify-email", requestUrl));
  }

  const result = await consumePendingSignupVerification(token);

  if (result.status === "success") {
    return NextResponse.redirect(new URL(result.redirectTo, requestUrl));
  }

  if (result.status === "selection_required") {
    const query = new URLSearchParams();
    query.set("token", token);
    query.set("state", result.status);
    return NextResponse.redirect(new URL(`/auth/verify-email?${query.toString()}`, requestUrl));
  }

  const query = new URLSearchParams();
  query.set("token", token);
  query.set("state", result.status);
  query.set("message", result.message);

  if (result.status === "blocked") {
    query.set("email", result.email);
  }

  return NextResponse.redirect(new URL(`/auth/verify-email?${query.toString()}`, requestUrl));
}
