import Link from "next/link";
import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/change-password-form";
import { getCurrentUser } from "@/lib/auth/session";

type ChangePasswordPageProps = {
  searchParams: Promise<{ required?: string; next?: string; error?: string; message?: string }>;
};

export default async function ChangePasswordPage({ searchParams }: ChangePasswordPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const required = params.required === "1" || Boolean(user?.mustChangePassword);
  const nextPath = params.next ?? "";

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent("/change-password")}`);
  }

  const errorMessage =
    params.error === "mismatch"
      ? "New passwords do not match."
      : params.error === "change_failed"
        ? params.message ?? "Unable to change password. Please try again."
        : null;

  const defaultNext =
    nextPath ||
    (user.role === "teacher"
      ? "/dashboard/teacher/profile"
      : user.role === "admin"
        ? "/admin/users"
        : "/");

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">{required ? "Set a new password" : "Change password"}</h1>
      <p className="mt-2 text-stone-500">
        {required
          ? "Your account uses a temporary password. Choose a new password before continuing."
          : "Update the password you use to sign in to Thryve."}
      </p>

      <ChangePasswordForm
        required={required}
        nextPath={defaultNext}
        errorMessage={errorMessage}
        cancelHref={required ? undefined : defaultNext}
      />

      {!required ? (
        <p className="mt-6 text-center text-sm text-stone-500">
          <Link className="font-semibold text-emerald-700" href={defaultNext}>
            Back
          </Link>
        </p>
      ) : null}
    </div>
  );
}
