import { getCurrentUser } from "@/lib/auth/session";

export async function getAdminDashboardContext() {
  const user = await getCurrentUser();

  if (!user) {
    return { status: "signed_out" as const };
  }

  if (user.role !== "admin") {
    return {
      status: "wrong_role" as const,
      user
    };
  }

  return {
    status: "ready" as const,
    user
  };
}
