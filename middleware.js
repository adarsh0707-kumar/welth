// middleware.js
import arcjetMiddleware from "./middleware.arcjet";
import clerkMiddleware from "./middleware.clerk";

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

export default async function middleware(req, ev) {
  await arcjetMiddleware(req, ev);
  await clerkMiddleware(req, ev);
}
