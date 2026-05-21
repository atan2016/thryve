import { changePasswordAction } from "@/lib/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";

type ChangePasswordFormProps = {
  required?: boolean;
  nextPath?: string;
  returnTo?: string;
  errorMessage?: string | null;
  cancelHref?: string;
  submitLabel?: string;
  compact?: boolean;
};

export function ChangePasswordForm({
  required = false,
  nextPath = "",
  returnTo = "",
  errorMessage,
  cancelHref,
  submitLabel = "Update password",
  compact = false
}: ChangePasswordFormProps) {
  const wrapperClass = compact
    ? "space-y-4"
    : "mt-8 space-y-4";

  return (
    <form action={changePasswordAction} className={wrapperClass}>
      {required ? <input name="required" type="hidden" value="1" /> : null}
      {nextPath ? <input name="next" type="hidden" value={nextPath} /> : null}
      {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Current password</span>
        <input name="currentPassword" type="password" required autoComplete="current-password" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">New password</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Confirm new password</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
        />
      </label>
      <p className="text-sm text-stone-500">Use at least {MIN_PASSWORD_LENGTH} characters.</p>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" type="submit">
          {submitLabel}
        </button>
        {cancelHref && !required ? (
          <a
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800"
            href={cancelHref}
          >
            Cancel
          </a>
        ) : null}
      </div>
    </form>
  );
}
