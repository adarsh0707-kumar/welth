import { seedTransactions } from "@/action/seed";

/**
 * API route handler for seeding transactions.
 * Calls `seedTransactions` to populate the database with sample transactions.
 *
 * @async
 * @function GET
 * @returns {Promise<Response>} JSON response containing the result of the seeding operation.
 *
 * @example
 * // Example usage via fetch
 * fetch('/api/seed-transactions')
 *   .then(res => res.json())
 *   .then(data => console.log(data));
 */

export async function GET() {
  const result = await seedTransactions()
  return Response.json(result);
}
