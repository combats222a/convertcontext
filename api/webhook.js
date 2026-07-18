// api/webhook.js
// Принимает уведомление от NOWPayments об оплате, проверяет подпись, сохраняет статус в KV

import crypto from 'crypto';
import { kv } from '@vercel/kv';

function sortObject(obj) {
  // NOWPayments требует, чтобы поля были отсортированы по ключу перед проверкой подписи
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])
      ? sortObject(obj[key])
      : obj[key];
    return result;
  }, {});
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const receivedSignature = req.headers['x-nowpayments-sig'];
  const sortedBody = JSON.stringify(sortObject(req.body));

  const expectedSignature = crypto
    .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
    .update(sortedBody)
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    console.error('Неверная подпись IPN — возможна подделка запроса');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { payment_status, order_id } = req.body;

  if (payment_status === 'finished' || payment_status === 'confirmed') {
    const [token, plan] = order_id.split(':');

    const now = Date.now();
    const expiresAt = plan === 'day'
      ? now + 24 * 60 * 60 * 1000        // +1 день
      : now + 30 * 24 * 60 * 60 * 1000;  // +30 дней

    await kv.set(`paid:${token}`, expiresAt);
  }

  return res.status(200).json({ received: true });
}
