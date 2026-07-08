const { execSync } = require('child_process');

if (!process.env.TEST_DATABASE_URL) {
  console.error("ERROR: TEST_DATABASE_URL is not set.");
  console.error("To prevent accidental data loss in staging/production, tests require a dedicated PostgreSQL test database URL.");
  process.exit(1);
}

if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  console.error("ERROR: TEST_DATABASE_URL cannot be the same as DATABASE_URL.");
  process.exit(1);
}

console.log("Safely running tests against isolated TEST_DATABASE_URL...");
try {
  // Pass the TEST_DATABASE_URL as DATABASE_URL to prisma and vitest
  execSync('npx cross-env DATABASE_URL=' + process.env.TEST_DATABASE_URL + ' npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });
  execSync('npx cross-env DATABASE_URL=' + process.env.TEST_DATABASE_URL + ' vitest run', { stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
