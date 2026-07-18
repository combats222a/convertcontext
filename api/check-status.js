// api/check-status.js
// Фронтенд спрашивает: "у меня такой-то токен, лимит снят?"

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'token обязателен' });
  }

  const expiresAt = await kv.get(`paid:${token}`);
  const isPaid = expiresAt && Number(expiresAt) > Date.now();

  return res.status(200).json({
    paid: !!isPaid,
    expiresAt: isPaid ? Number(expiresAt) : null
  });
}
