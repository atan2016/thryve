export const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(newPassword: string, confirmPassword?: string) {
  const trimmed = newPassword.trim();

  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (confirmPassword !== undefined && trimmed !== confirmPassword.trim()) {
    return "New passwords do not match.";
  }

  return null;
}

export async function assertNewPasswordDiffersFromCurrent(
  newPassword: string,
  verifyCurrent: (plain: string) => Promise<boolean>
) {
  if (await verifyCurrent(newPassword)) {
    throw new Error("Choose a password that is different from your current password.");
  }
}
