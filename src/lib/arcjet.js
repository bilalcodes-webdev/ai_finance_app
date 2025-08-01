import arcjet, {  tokenBucket } from "@arcjet/next";


const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  characteristics: ["userId"], // Track requests by IP
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 2, // Refill 5 tokens per interval
      interval: 3600, // Refill every 10 seconds
      capacity: 2, // Bucket capacity of 10 tokens
    }),
  ],
});


export default aj