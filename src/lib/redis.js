// // lib/redis.js
// import { createClient } from "redis";

// const redisClient = createClient({
//   url: process.env.REDIS_URL,
//   legacyMode: true,
// });

// redisClient.on("error", (err) => console.error("Redis Client Error", err));

// if (!redisClient.isOpen) {
//   redisClient.connect().catch(console.error);
// }

// export default redisClient;
