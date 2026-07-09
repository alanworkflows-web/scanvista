import request from 'supertest';
import { startServer } from '../server.ts';

async function runTests() {
  process.env.NODE_ENV = 'test';
  process.env.SESSION_SECRET = 'test_secret';
  process.env.GOOGLE_CLIENT_ID = 'test_client_id';
  process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/auth/google/callback';

  const app = await startServer();
  const agent = request.agent(app);

  console.log("TEST 1: Valid State");
  const res1 = await agent.get('/auth/google');
  if (res1.status !== 302) {
    console.error("Expected 302, got", res1.status);
    process.exit(1);
  }
  
  const location = res1.headers.location;
  const stateMatch = location.match(/state=([^&]+)/);
  const state = stateMatch ? stateMatch[1] : null;
  if (!state) {
    console.error("State not found in redirect URL");
    process.exit(1);
  }

  const res2 = await agent.get(`/auth/google/callback?state=${state}&code=mock_code`);
  if (res2.status === 400 && res2.text === "Invalid state parameter") {
    console.error("FAIL: Valid state was rejected!");
    process.exit(1);
  }
  console.log("PASS: Valid state accepted (or advanced past the state check).");

  console.log("TEST 2: Invalid/Tampered State");
  const res3 = await agent.get(`/auth/google/callback?state=tampered_state&code=mock_code`);
  if (res3.status !== 400 || res3.text !== "Invalid state parameter") {
    console.error("FAIL: Tampered state was not rejected properly! Got", res3.status, res3.text);
    process.exit(1);
  }
  console.log("PASS: Tampered state rejected.");
  
  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
