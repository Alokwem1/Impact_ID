# Alembic Migrations

This directory contains database migrations for the Impact ID backend.

## Usage

Autogenerate a new migration after modifying models:

```
alembic revision --autogenerate -m "describe change"
```

Apply migrations:

```
alembic upgrade head
```

Downgrade (undo last migration):

```
alembic downgrade -1
```

Check current revision:

```
alembic current
```

Stamp the database with the current head without running migrations (use cautiously):

```
alembic stamp head
```

## Notes
- Uses async engine; autogenerate runs fine even with async URL.
- Ensure `DATABASE_URL` is set (e.g. to a Postgres DB in production) before running migrations.
- For SQLite dev, schema diffs may be limited (ALTER support is constrained); prefer Postgres for production.
