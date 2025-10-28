# Seeding the database

This project includes a TypeScript seed script at `prisma/seed.ts`. The preferred workflow avoids committing compiled artifacts and supports secure bootstrap passwords.

Steps

1. Copy `.env.example` to `.env` and edit any values (do not commit `.env`):

```powershell
cp .env.example .env
# or in PowerShell
Copy-Item .env.example .env
```

2. (Optional but recommended) Provide a secure seed admin password as an environment variable:

```powershell
# PowerShell example
$env:SEED_ADMIN_PASSWORD = "My$ecureP@ssw0rd"
```

If you do not provide `SEED_ADMIN_PASSWORD`, the seed script will generate a secure random password and print it to stdout. Save that password.

3. Ensure Postgres is running (uses `docker-compose.yml`):

```powershell
docker-compose up -d
```

4. Run the seeding flow (build + run):

```powershell
pnpm seed:build
pnpm seed
```

Notes

- The project now ignores `dist-seed/`; compiled seed artifacts should not be committed.
- The seed script reads `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from the environment. By default it uses `admin@berkeley-math.org` for the email.
- `prisma generate` is run automatically on `postinstall` (or run `pnpm prisma:generate`).

If you want me to change the seed flow to use `ts-node` directly (no compile step), say so and I can update the scripts accordingly.