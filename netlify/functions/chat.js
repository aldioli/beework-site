exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { message, history = [] } = JSON.parse(event.body);

    const messages = [
      ...history.slice(-8), // keep last 8 messages only
      { role: 'user', content: message },
    ];

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `أنت مساعد ذكي ودود لموقع beework.art، الموقع الشخصي لحسين العولقي مطور التطبيقات والمواقع الإبداعية.

خدماتنا:
- تطبيقات الجوال بـ Flutter للـ iOS والأندرويد
- بوتات الذكاء الاصطناعي بـ Claude AI على تيليغرام
- المواقع الإبداعية بـ GSAP وLenis وThree.js
- أنظمة المحاسبة: Odoo ERP وZATCA وGoogle Sheets

مشاريعنا: BeeHive (سوق العمالة)، YemenPay (محفظة رقمية)، @Alawlaqi_AI (بوت تيليغرام)

للتواصل: aldioli7@gmail.com أو تيليغرام @Alawlaqi_AI_bot

تعليمات: أجب دائماً بالعربية بأسلوب ودود ومختصر. لا تذكر أسعاراً محددة ووجّه للتواصل المباشر عند الحاجة.`,
        messages,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || 'API error');

    const reply = data.content[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: reply,
        history: [...messages, { role: 'assistant', content: reply }],
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'حدث خطأ في الخادم' }),
    };
  }
};
