const request = require('supertest');
const { startServer } = require('./dist/server.cjs');

async function runRaceTest() {
  process.env.NODE_ENV = 'test';
  process.env.GOOGLE_CLIENT_ID = 'test-client';
  
  const app = await startServer();
  
  // 1. Get an initial session
  console.log("Starting concurrency test...");
  const agent = request.agent(app);
  
  // Fire 5 parallel requests
  console.log("Firing 5 parallel GET /auth/google requests...");
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(agent.get('/auth/google').redirects(0));
  }
  
  const responses = await Promise.all(promises);
  let states = [];
  
  for (let i = 0; i < 5; i++) {
    const res = responses[i];
    // extract state from the redirect URL
    if (res.status === 302 && res.headers.location) {
      const url = new URL(res.headers.location);
      const state = url.searchParams.get('state');
      if (state) states.push(state);
    }
  }
  
  console.log(`Captured ${states.length} states:`, states.map(s => s.substring(0, 6) + '...'));
  
  // Wait a moment for async saves
  await new Promise(r => setTimeout(r, 1000));
  
  // Now verify them by calling callback
  console.log("Verifying states via callback...");
  let successCount = 0;
  for (const state of states) {
    const res = await agent.get('/auth/google/callback?state=' + state + '&code=test').redirects(0);
    if (res.status !== 400 && !res.text.includes("Session Expired")) {
      successCount++;
    } else {
      console.log(`State ${state.substring(0, 6)}... rejected!`);
    }
  }
  
  console.log(`Verification complete. ${successCount}/${states.length} states remained valid.`);
  
  if (successCount < states.length) {
    console.log("ROOT CAUSE = SESSION_READ_MODIFY_WRITE_LOST_UPDATE");
  } else {
    console.log("Concurrency is SAFE.");
  }
  process.exit(0);
}

runRaceTest().catch(console.error);
