import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { createUser, getUserByEmail, getUserById } from "@/lib/store";
import type { Role } from "@/lib/types";

const SESSION_COOKIE = "yoga_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "development-session-secret-change-me");

type SessionPayload = {
  userId: string;
  role: Role;
};

async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function createSession(userId: string, role: Role) {
  const token = await signSession({ userId, role });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return getUserById(session.userId);
}

export async function signIn(email: string, password: string) {
  const user = getUserByEmail(email);

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }

  await createSession(user.id, user.role);
  return user;
}

export async function signUp(input: { name: string; email: string; password: string; role: Role }) {
  if (getUserByEmail(input.email)) {
    throw new Error("That email is already in use.");
  }

  const user = createUser(input);
  await createSession(user.id, user.role);
  return user;
}
