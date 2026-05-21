import { redirectIfMustChangePassword } from "@/lib/auth/require-password-changed";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureTeacherProfile } from "@/lib/persistence";

export async function getTeacherDashboardContext() {
  const user = await getCurrentUser();

  if (!user) {
    return { status: "signed_out" as const };
  }

  if (user.role !== "teacher") {
    return {
      status: "wrong_role" as const,
      user
    };
  }

  redirectIfMustChangePassword(user);

  return {
    status: "ready" as const,
    user,
    teacher: await ensureTeacherProfile(user.id, user.name)
  };
}
