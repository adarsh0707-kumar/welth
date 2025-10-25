import { Inngest } from "inngest";

/**
 * Inngest client instance for sending and receiving events.
 *
 * This client is configured for the "Welth" project and includes
 * a retry strategy with exponential backoff.
 *
 * @constant {Inngest} inngest
 * @example
 * // Sending an event
 * await inngest.send({
 *   name: "transaction.created",
 *   data: { userId: "123", amount: 100 }
 * });
 *
 * @example
 * // Creating a function
 * inngest.createFunction({ name: "My Function" }, async ({ event, step }) => { ... });
 */

export const inngest = new Inngest({
  id: "welth",
  name: "Welth",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // exponential backoff
    maxAttempts: 2, // maximum 2 retry attempts
  }),
});
