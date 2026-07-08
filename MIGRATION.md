# Database Migration Steps

To deploy to production with PostgreSQL:

1. Provision a PostgreSQL database.
2. Set the `DATABASE_URL` environment variable to your PostgreSQL connection string.
   - Example: `DATABASE_URL=postgresql://user:password@host:port/database?schema=public`
3. Generate the Prisma Client for PostgreSQL:
   - `npx prisma generate`
4. Run Prisma database push (for prototype) or create migrations (for production):
   - Note: For production applications, you should use `npx prisma migrate deploy` instead of `db push` to apply existing migrations securely. 
   - To create the initial migration from the schema: `npx prisma migrate dev --name init`
5. Do not run destructive automatic migrations in production. Ensure `npx prisma migrate resolve` or similar tools are used if manual intervention is needed.
