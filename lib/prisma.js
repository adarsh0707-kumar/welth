import { PrismaClient } from "./generated/prisma/client";

/**
 * Prisma Client instance for database access.
 *
 * - In production, a single instance is used per process.
 * - In development, it avoids multiple instances when using hot-reloading
 *   by storing the client on `globalThis.prisma`.
 *
 * @type {PrismaClient}
 * @example
 * import { db } from '@/lib/prisma';
 *
 * const users = await db.user.findMany();
 * console.log(users);
 */
export const db = globalThis.prisma || new PrismaClient();

// In development, attach the client to the global object to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
