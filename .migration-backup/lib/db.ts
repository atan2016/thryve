import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

/** Recreate the client after schema changes (e.g. new models) so dev HMR does not keep a stale delegate. */
function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && "passwordResetToken" in cached) {
    return cached;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const db = getPrismaClient();

const originalDb = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, receiver) as unknown;

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }

    return value;
  }
});
