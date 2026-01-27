# Database Migrations Guide

## Database Configuration

The backend uses the **`app-db`** PostgreSQL database:
- **Service name**: `app-db` (in docker-compose.yml)
- **Database name**: `portfolio_app`
- **User**: `app_user`
- **Password**: `app_pass`
- **Port**: `5433` (host) / `5432` (container)
- **Connection string**: `postgres://app_user:app_pass@app-db:5432/portfolio_app`

## Making Schema Changes

When you need to modify the database schema (add/remove tables, columns, etc.):

### Step 1: Modify the Schema
Edit `backend/src/lib/db/schema.ts` to make your changes:
- Add/remove tables
- Add/remove columns
- Change column types
- Add indexes, constraints, etc.

### Step 2: Generate Migration
Run the migration generator:
```bash
cd backend
npm run db:generate
```

This will:
- Compare your schema with the current database state
- Generate a new migration file in `backend/drizzle/` directory
- Create a SQL file with the changes (e.g., `0001_xyz.sql`)

### Step 3: Apply Migration

**For Development (Docker):**
```bash
# Option 1: Push directly (recommended for dev)
cd backend
npm run db:push
```

**For Production:**
You should use a migration runner. The generated SQL files in `backend/drizzle/` can be applied manually or using a migration tool.

### Example Workflow

1. **Add a new column to projects table:**
   ```typescript
   // In backend/src/lib/db/schema.ts
   export const projects = pgTable("projects", {
     // ... existing fields
     newField: text("new_field"), // Add this
   });
   ```

2. **Generate migration:**
   ```bash
   cd backend
   npm run db:generate
   ```

3. **Apply migration:**
   ```bash
   npm run db:push
   ```

## Important Notes

- **Always backup your database** before running migrations in production
- **Test migrations** in development first
- **Review generated SQL** files before applying
- The `db:push` command directly applies changes (good for dev)
- For production, consider using a migration runner that tracks applied migrations

## Current Migrations

- **`0000_lean_mantis.sql`** – Creates all base tables (skills, projects, work_experience, education, hobbies, testimonials, contact_messages, resumes, contact_info).
- **`0001_education_text_to_jsonb.sql`** – Converts education `degree`, `institution`, `location`, `description` from `text` to `jsonb` and backfills existing rows as `{ "en": "<value>", "fr": "<value>" }`. Idempotent (only alters when columns are still text). Run via `npm run db:migrate`; the Docker entrypoint runs it before `db:push`.
