// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";
import arcjet, { createMiddleware, shield, detectBot } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});
const arcjetMiddleware = createMiddleware(aj);

export default clerkMiddleware(async (auth, req, ev) => {
  // run Arcjet middleware first
  await arcjetMiddleware(req, ev);

  const { userId, redirectToSignIn } = await auth();
  const protectedRoutes = ["/dashboard", "/account", "/transaction"];
  if (
    !userId &&
    protectedRoutes.some((r) => req.nextUrl.pathname.startsWith(r))
  ) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
