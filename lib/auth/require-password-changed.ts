import { redirect } from "next/navigation";

import type { AppUser } from "@/lib/types";

export function redirectIfMustChangePassword(user: AppUser, nextPath?: string) {
  if (!user.mustChangePassword) {
    return;
  }

  const params = new URLSearchParams({ required: "1" });
  if (nextPath?.trim()) {
    params.set("next", nextPath.trim());
  }

  redirect(`/change-password?${params.toString()}`);
}
