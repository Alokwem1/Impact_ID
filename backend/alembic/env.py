"""Alembic environment configuration (async) for Impact ID.

This sets up asynchronous SQLAlchemy engine bindings and targets the metadata from
`app.models` so that autogenerate picks up model changes.
"""
from __future__ import annotations

import asyncio
import logging
import os
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from alembic import context

# Interpret the config file for Python logging.
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
logger = logging.getLogger("alembic.env")

# Ensure application modules are importable
import sys
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))  # project/backend
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Import models & metadata
from app.database import Base, db_config  # noqa: E402
import app.models  # noqa: F401,E402  Ensure models are registered

target_metadata = Base.metadata

# Database URL: prefer ENV, fall back to db_config
def get_url() -> str:
    url = os.getenv("DATABASE_URL") or db_config.database_url
    # Alembic expects synchronous driver for some offline ops; we keep async for runtime
    return url

# Include naming convention or other autogen options here if needed
def include_object(object_, name, type_, reflected, compare_to):  # noqa: D401
    return True


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_object=include_object,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = create_async_engine(get_url(), poolclass=pool.NullPool)

    async def run() -> None:
        async with connectable.connect() as connection:  # type: ignore[arg-type]
            await connection.run_sync(do_run_migrations)

    asyncio.run(run())


if context.is_offline_mode():  # pragma: no cover - environment driven
    run_migrations_offline()
else:  # pragma: no cover - environment driven
    run_migrations_online()
