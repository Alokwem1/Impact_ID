"""Central logging configuration with structured JSON support.

Provides a JSON formatter that enriches log records with standard fields:
 timestamp, level, logger, message, request correlation metadata, and
 environment context. Sensitive fields are redacted.
"""
from __future__ import annotations

import json
import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict

SENSITIVE_KEYS = {"password", "authorization", "token", "access_token", "refresh_token"}
SENSITIVE_PATTERN = re.compile(r"(password|authorization|token|access_token|refresh_token)", re.IGNORECASE)


def _redact(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: ("***" if k.lower() in SENSITIVE_KEYS else _redact(v)) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [ _redact(v) for v in value ]
    if isinstance(value, str) and SENSITIVE_PATTERN.search(value):
        return "***REDACTED***"
    return value


class JSONLogFormatter(logging.Formatter):
    """Format log records as structured JSON."""

    def format(self, record: logging.LogRecord) -> str:  # noqa: D401
        base: Dict[str, Any] = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Optional extras we commonly attach
        for attr in [
            "request_id","path","method","status","duration_ms","ip","ua","user_id","event","component"
        ]:
            if hasattr(record, attr):
                base[attr] = getattr(record, attr)

        # Environment context (cached env read is cheap)
        base["environment"] = os.getenv("ENVIRONMENT", "development")
        base["service"] = os.getenv("SERVICE_NAME", "impact-id-backend")
        base["version"] = os.getenv("APP_VERSION", "unknown")

        # Redact sensitive material
        base = _redact(base)
        try:
            return json.dumps(base, separators=(",", ":"), ensure_ascii=False)
        except Exception:  # pragma: no cover (fallback)
            return super().format(record)


def init_logging(force_json: bool | None = None) -> None:
    """Initialize root logging with optional JSON output.

    force_json: override environment detection if provided.
    Environment variables:
      JSON_LOGS=true|false  enable JSON logs (default true in production, false otherwise)
      LOG_LEVEL=INFO|DEBUG|... root level
    """
    json_pref_env = os.getenv("JSON_LOGS")
    if force_json is not None:
        use_json = force_json
    elif json_pref_env is not None:
        use_json = json_pref_env.lower() in ("1","true","yes","on")
    else:
        use_json = os.getenv("ENVIRONMENT","development") in ("staging","production")

    level = os.getenv("LOG_LEVEL", "INFO").upper()
    root = logging.getLogger()
    # Clear existing handlers if re-init during tests
    for h in list(root.handlers):
        root.removeHandler(h)

    handler = logging.StreamHandler()
    if use_json:
        handler.setFormatter(JSONLogFormatter())
    else:
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s - %(message)s"))
    root.setLevel(level)
    root.addHandler(handler)

    # Reduce noise from third-party loggers
    for noisy in ["uvicorn", "uvicorn.access", "asyncio", "sqlalchemy.engine"]:
        logging.getLogger(noisy).setLevel(os.getenv("THIRD_PARTY_LOG_LEVEL","WARNING"))

    root.debug("Logging initialized (json=%s, level=%s)", use_json, level)


__all__ = ["init_logging", "JSONLogFormatter"]
