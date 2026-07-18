// api/check-status.js
// Фронтенд спрашивает: "у меня такой-то токен, лимит снят?"

import { createClient } from 'redis';

let redisClient;
async function getRedis() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
  }
  return redisClient;
}

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'token обязателен' });
  }

  const redis = await getRedis();
  const expiresAt = await redis.get(`paid:${token}`);
  const isPaid = expiresAt && Number(expiresAt) > Date.now();

  return res.status(200).json({
    paid: !!isPaid,
    expiresAt: isPaid ? Number(expiresAt) : null
  });
}
