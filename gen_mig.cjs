const { execSync } = require('child_process');
require('dotenv').config();
execSync('npx prisma migrate diff --from-url "' + process.env.DATABASE_URL + '" --to-schema-datamodel prisma/schema.prisma --script > new_migration.sql', { stdio: 'inherit' });
