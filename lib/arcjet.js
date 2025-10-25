import arcjet, { tokenBucket } from "@arcjet/next";

/**
 * Arcjet client instance for rate-limiting and abuse prevention.
 *
 * This client is configured to:
 * - Identify users by Clerk `userId`.
 * - Use a token bucket rate-limiting rule:
 *    - Refill 5 tokens every 60 seconds
 *    - Maximum capacity of 5 tokens
 *
 * @constant {import("@arcjet/next").Arcjet} aj
 * @example
 * // Middleware usage
 * import aj from './middleware.arcjet';
 * export default async function middleware(req, ev) {
 *   await aj.check(req);
 *   ...
 * }
 */
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Track based on Clerk User ID
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: "60s",
      capacity: 5,
    }),
  ],
});

export default aj;
