import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.vercel' });

async function run() {
  const apiKey = process.env.PADDLE_API_KEY;
  const customerId = 'ctm_01kx9jjzaby1jzmxnmq5q4y43j';
  const subId = 'sub_01kxbvex91r9n11mb1x13jhjzs';
  const apiUrl = `https://sandbox-api.paddle.com/customers/${customerId}/portal-sessions`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ subscription_ids: [subId] })
  });
  
  const data = await response.json();
  console.dir(data, { depth: null });
}

run();
