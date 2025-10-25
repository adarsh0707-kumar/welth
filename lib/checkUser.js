'use server';

import { db } from "./prisma";
import { currentUser } from "@clerk/nextjs/server"


/**
 * Checks if the current user exists in the database.
 * 
 * - Uses Clerk `currentUser` to get the logged-in user.
 * - If the user exists in the database, returns the existing user record.
 * - If the user does not exist, creates a new user record in the database with:
 *    - `clerkUserId`
 *    - `name` (first + last name)
 *    - `imageUrl`
 *    - `email`
 * - Returns `null` if no user is logged in.
 * 
 * @async
 * @function checkUser
 * @returns {Promise<Object|null>} Returns the user object from the database or `null` if no user is logged in.
 * @example
 * import { checkUser } from '@/lib/checkUser';
 * 
 * const user = await checkUser();
 * if (user) {
 *   console.log(`Logged in as ${user.name}`);
 * } else {
 *   console.log("No user logged in");
 * }
 */


export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return newUser;
  }
  catch (err) {
    console.error("Error: ",err.message)
  }
}