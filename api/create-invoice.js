// api/create-invoice.js
// Создаёт инвойс в NOWPayments и возвращает ссылку на оплату

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, plan } = req.body;

  if (!token || !plan) {
    return res.status(400).json({ error: 'token и plan обязательны' });
  }

  // Тарифы
  const PRICES = {
    day: 1,    // $1 — снять лимит на сегодня
    month: 3   // $3 — безлимит на месяц
  };

  const amount = PRICES[plan];
  if (!amount) {
    return res.status(400).json({ error: 'Неизвестный тариф' });
  }

  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        order_id: `${token}:${plan}`, // сюда зашиваем токен и тариф, вебхук потом это прочитает
        order_description: plan === 'day' ? 'Снятие лимита на день' : 'Подписка на месяц',
        ipn_callback_url: `https://${req.headers.host}/api/webhook`,
        success_url: `https://${req.headers.host}/?paid=1`,
        cancel_url: `https://${req.headers.host}/?paid=0`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('NOWPayments error:', data);
      return res.status(500).json({ error: 'Не удалось создать инвойс' });
    }

    return res.status(200).json({ invoice_url: data.invoice_url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
