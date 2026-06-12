import bcrypt from "bcryptjs";

const BCRYPT_PREFIX = "$2";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, storedPassword: string) {
  if (storedPassword.startsWith(BCRYPT_PREFIX)) {
    return bcrypt.compare(password, storedPassword);
  }

  return storedPassword === password;
}
