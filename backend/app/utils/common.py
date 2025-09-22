"""
Utility functions for the Impact ID backend.
"""

from datetime import datetime, timezone
from typing import Any


def utcnow() -> datetime:
    """
    Get current UTC datetime without timezone info for SQLite compatibility.
    
    This replaces utcnow() which is deprecated in Python 3.12+.
    Returns a timezone-naive datetime in UTC.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


class DatabaseError(Exception):
    """Custom database exception for better error handling."""
    pass


class HealthCheckError(DatabaseError):
    """Specific exception for database health check failures."""
    pass


# Constants to avoid string duplication
class TableNames:
    """Table name constants to avoid duplication."""
    USERS = "users"


class CascadeOptions:
    """Cascade option constants to avoid duplication."""
    ALL_DELETE_ORPHAN = "all, delete-orphan"


class ErrorMessages:
    """Common error message constants."""
    TASK_NOT_FOUND = "Task not found"
    USER_NOT_FOUND = "User not found"
    UNAUTHORIZED = "Unauthorized"
    INVALID_INPUT = "Invalid input"