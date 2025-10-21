import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Track bases on Clerk User ID
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: "60s", // 
      capacity: 5,
    })
  ]
})

export default aj;
