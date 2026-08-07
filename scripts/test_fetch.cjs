const http = require('http');

http.get('http://127.0.0.1:3000/auth/dev/login?email=test.fetch@example.com&returnTo=/manager/onboarding', (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('BODY:', data));
}).on('error', err => {
  console.log('ERROR:', err.message);
});
