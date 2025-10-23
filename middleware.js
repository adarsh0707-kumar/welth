// middleware.js  (root file)
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

export default createMiddleware(aj);

export const config = {
  // Protect all app and API routes except static assets
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};