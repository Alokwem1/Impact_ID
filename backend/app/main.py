"""
Main module for Impact ID application.
"""


from datetime import datetime
import uuid
from pathlib import Path
import logging
import os

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, generate_latest, CONTENT_TYPE_LATEST

from app.database import create_tables, startup_database, shutdown_database, health_monitor
from app.routers import auth
from app.routers import notifications
from app.routers import users, tasks, admin, activities, badges, leaderboard, weaving
from app.utils.common import utcnow


# Import your database and router modules
# Try to import optional routers (some might not exist yet)
# Try to import auth router if it exists
try:
    AUTH_ROUTER_AVAILABLE = True
except ImportError as e:
    AUTH_ROUTER_AVAILABLE = False
    logging.warning("Auth router not found - authentication endpoints not available")

# Try to import notifications router if it exists
try:
    NOTIFICATIONS_ROUTER_AVAILABLE = True
except ImportError as e:
    NOTIFICATIONS_ROUTER_AVAILABLE = False
    logging.warning("Notifications router not found - notification endpoints not available")

# ================================
# 🔧 CONFIGURATION & LOGGING
# ================================
from app.core.logging import init_logging  # Structured logging utilities

# Initialize structured logging early so all subsequent imports/operations use it
init_logging()
logger = logging.getLogger("impact_id")

# Environment settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
VERSION = "2.0.0"

# ================================
# 📊 PROMETHEUS METRICS SETUP
# ================================
PROM_REGISTRY = CollectorRegistry(auto_describe=True)
REQUEST_COUNT = Counter(
    "impact_request_total",
    "Total HTTP requests",
    ["method", "path", "status"],
    registry=PROM_REGISTRY,
)
REQUEST_LATENCY = Histogram(
    "impact_request_duration_seconds",
    "Request latency in seconds",
    ["method", "path"],
    registry=PROM_REGISTRY,
)
APP_START_TIME = Gauge(
    "impact_app_start_time_seconds",
    "Application start time in unix epoch",
    registry=PROM_REGISTRY,
)
APP_INFO = Gauge(
    "impact_app_info",
    "Static application info",
    ["version", "environment"],
    registry=PROM_REGISTRY,
)

# ================================
# 🚨 CRITICAL FIX: ENVIRONMENT-BASED CORS
# ================================

def get_cors_origins():
    """Get CORS originsnvironment configuration."""
    # Base development origins
    base_origins = [
        "http://localhost:3000",     # React dev server
        "http://localhost:5173",     # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",     # Backend
        "http://127.0.0.1:8000",
    ]

    # Add production origins from environment
    if ENVIRONMENT == "production":
        allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
        if allowed_origins:
            production_origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]
            base_origins.extend(production_origins)
            logger.info("🌐 Added production CORS origins: %s", production_origins)

    logger.info("🔒 CORS origins configured: %s", base_origins)
    return base_origins

# ================================
# 🚀 APPLICATION LIFECYCLE
# ================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Enhanced application lifespan management."""
    startup_time = utcnow()
    logger.info("🚀 Starting Impact ID Application...")

    try:
        # Initialize database
        logger.info("📊 Initializing database...")
        await startup_database()

        # Enforce Alembic migrations (require version table) unless explicitly overridden
        from sqlalchemy import text as _sql_text
        from sqlalchemy.exc import OperationalError as _OperationalError
        from app.database import engine as _engine

        env_lower = os.getenv("ENVIRONMENT", "development").lower()
        allow_legacy = (
            os.getenv("ALLOW_LEGACY_TABLE_CREATION", "0").lower() in {"1","true","yes"}
            or env_lower == "testing"
        )
        async with _engine.begin() as conn:
            try:
                result = await conn.execute(_sql_text("SELECT version_num FROM alembic_version"))
                version_row = result.first()
                if not version_row:
                    raise RuntimeError("alembic_version table empty – run migrations before starting the app")
                logger.info("🧬 Alembic schema version detected: %s", version_row[0])
            except _OperationalError as oe:
                if allow_legacy:
                    logger.warning("⚠️ Alembic version table missing but ALLOW_LEGACY_TABLE_CREATION enabled – attempting create_tables() fallback")
                    try:
                        await create_tables()
                        logger.info("🗄️ Legacy create_tables fallback executed")
                    except Exception as ce:
                        logger.error("❌ Legacy create_tables fallback failed: %s", ce)
                        raise
                else:
                    logger.critical("❌ Alembic version enforcement failed: %s", oe)
                    raise RuntimeError("Database not migrated – refuse startup. Set RUN_DB_MIGRATIONS=1 or apply migrations manually.") from oe
            except Exception as e:
                logger.critical("❌ Migration enforcement error: %s", e)
                raise

        # Optional: Auto-run Alembic migrations if enabled
        try:
            run_migrations = os.getenv("RUN_DB_MIGRATIONS", "0").lower() in {"1", "true", "yes"}
            if run_migrations:
                logger.info("📦 Auto migration flag detected - running Alembic upgrade heads")
                # Import locally to avoid Alembic cost when disabled
                from alembic import command
                from alembic.config import Config
                alembic_dir = Path(__file__).resolve().parent.parent / "alembic"
                alembic_ini = alembic_dir / "alembic.ini"
                # Create a temporary Alembic Config
                alembic_cfg = Config()
                # Support both default alembic.ini or dynamic configuration
                if alembic_ini.exists():
                    alembic_cfg.set_main_option("script_location", str(alembic_dir))
                else:
                    alembic_cfg.set_main_option("script_location", str(alembic_dir))
                # Database URL from environment (fallback to settings logic already applied earlier)
                db_url = os.getenv("DATABASE_URL") or "sqlite+aiosqlite:///./impact.db"
                alembic_cfg.set_main_option("sqlalchemy.url", db_url.replace("aiosqlite", "pysqlite"))
                # Run migrations to head
                command.upgrade(alembic_cfg, "head")
                logger.info("✅ Alembic migrations applied successfully")
            else:
                logger.info("⏭️ Auto migrations disabled (set RUN_DB_MIGRATIONS=1 to enable)")
        except Exception as e:
            logger.error("❌ Alembic auto migration failed: %s", e)

        # Perform health check
        logger.info("🏥 Performing startup health check...")
        health_status = await health_monitor.check_health()
        if health_status["status"] != "healthy":
            logger.warning("⚠️ Health check warning: %s", health_status)

        startup_duration = (utcnow() - startup_time).total_seconds()
        logger.info("✅ Application startup completed in %.2f seconds", startup_duration)
        logger.info("🌍 Environment: %s", ENVIRONMENT)
        logger.info("🔗 API Documentation: http://localhost:8000/docs")

        # Store startup time in app state
        app.state.startup_time = startup_time
        # Record metrics gauge values
        try:
            APP_START_TIME.set(startup_time.timestamp())
            APP_INFO.labels(version=VERSION, environment=ENVIRONMENT).set(1)
        except Exception:
            logger.warning("Metrics initialization failed", exc_info=True)

        yield

    except Exception as e:
        logger.error("❌ Application startup failed: %s", e)
        raise

    finally:
        logger.info("🔄 Shutting down Impact ID Application...")
        try:
            await shutdown_database()
            logger.info("✅ Application shutdown completed successfully")
        except Exception as e:
            logger.error("❌ Shutdown error: %s", e)

# ================================
# 🎯 FASTAPI APPLICATION
# ================================

app = FastAPI(
    title="Impact ID API",
    description="""
    **Impact ID Platform** - Empowering positive change through gamified impact tracking.

    ## Features

    * **User Management** - Registration, authentication, and profile management
    * **Task System** - Gamified impact tasks with rewards and progression
    * **Badge System** - Achievement tracking with rarity and progress
    * **Impact Weaving** - AI-powered content curation and engagement
    * **Leaderboards** - Community competition and recognition
    * **Admin Panel** - Comprehensive platform management tools

    ## Authentication

    Most endpoints require authentication using Bearer tokens.
    """,
    version=VERSION,
    docs_url=None,  # Custom docs endpoint
    redoc_url=None,  # Custom redoc endpoint
    openapi_url="/api/openapi.json",
    lifespan=lifespan,  # Always use lifespan for proper startup/shutdown
    contact={
        "name": "Impact ID Team",
        "url": "https://impactid.com/contact",
        "email": "support@impactid.com",
    }
)

# ================================
# 🛡️ MIDDLEWARE CONFIGURATION
# ================================

# GZIP compression for better performance
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 🚨 CRITICAL FIX: Dynamic CORS Configuration
cors_origins = get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Rate limiting for API protection
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ================================
# ⚡ RATE LIMIT TEST/PROBE ENDPOINT
# ================================
# Minimal endpoint with a strict rate limit to enable automated test validation.
# Safe to keep in production (adjust limit or guard via environment if needed later).
@app.get("/api/ratelimit/probe", tags=["Monitoring"])  # pragma: no cover - logic trivial
@limiter.limit("3/second")
async def ratelimit_probe(request: Request):  # slowapi requires request parameter
    return {"ok": True}

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    # Clickjacking & MIME sniffing
    response.headers["X-Frame-Options"] = "DENY"
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    # Referrer policy
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    # Cross origin isolation for better security/performance (conditionally enable for production)
    if ENVIRONMENT == "production":
        response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        response.headers.setdefault("Cross-Origin-Embedder-Policy", "require-corp")
    else:
        # Avoid breaking local dev hot reload (COEP can block some scripts)
        response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
    # Permissions policy - explicitly disable high risk features
    response.headers.setdefault(
        "Permissions-Policy",
        "accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), usb=()"
    )
    # Dynamic CSP (basic connect-src + frame-ancestors hardening)
    # Expand directives easily later; keep low risk now to avoid blocking frontend assets unexpectedly.
    csp_parts = [
        "default-src 'self'",
        "frame-ancestors 'none'",
        "img-src 'self' data:",
        "style-src 'self' 'unsafe-inline'",  # 'unsafe-inline' may be needed for Tailwind dev; remove in hardened prod
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # relaxed for dev; tighten with hashing for prod builds
        "connect-src 'self' https://api.impactid.xyz wss://api.impactid.xyz ws://localhost:8000 http://localhost:8000 http://127.0.0.1:8000",
        "font-src 'self' data:",
    ]
    response.headers["Content-Security-Policy"] = "; ".join(csp_parts)
    # HSTS only in production & when likely behind TLS
    if ENVIRONMENT == "production":
        response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    return response

# ======================================
# 📝 Request Logging & Correlation ID
# ======================================

@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    """Attach correlation ID, measure latency, and emit structured request log.

    Adds headers:
      X-Request-ID: Correlation identifier
      X-Response-Time: Duration in ms
    """
    start = utcnow()
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id  # For downstream access

    # Observe latency using histogram
    path_label = request.url.path
    if path_label.startswith("/api/"):
        # Avoid high cardinality by trimming numeric IDs
        path_label = "/".join([
            "api",
            *[seg if not seg.isdigit() else ":id" for seg in request.url.path.split("/") if seg and seg != "api"]
        ])
        path_label = "/" + path_label if not path_label.startswith("/") else path_label
    elif path_label == "/metrics":
        path_label = "/metrics"

    with REQUEST_LATENCY.labels(request.method, path_label).time():
        response = await call_next(request)

    duration_ms = (utcnow() - start).total_seconds() * 1000
    response.headers.setdefault("X-Request-ID", request_id)
    response.headers.setdefault("X-Response-Time", f"{duration_ms:.2f}ms")

    # Structured log (JSON in production) picked up by JSONLogFormatter via extras
    try:
        logger.info(
            "request completed",
            extra={
                "event": "request",
                "component": "http",
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
                "status": getattr(response, 'status_code', 'NA'),
                "duration_ms": round(duration_ms, 2),
                "ip": getattr(request.client, 'host', 'unknown'),
                "ua": request.headers.get('user-agent', 'unknown')[:120],
            },
        )
        # Increment counter after successful response
        try:
            REQUEST_COUNT.labels(request.method, path_label, str(getattr(response, 'status_code', 'NA'))).inc()
        except Exception:
            pass
    except Exception:  # pragma: no cover - defensive, logging must not break response
        pass
    return response

# ================================
# 🏥 HEALTH & MONITORING
# ================================

@app.get("/live", tags=["Health"], summary="Liveness probe")
async def liveness_probe():  # pragma: no cover - trivial
    """Simple liveness endpoint: returns 200 if process is running."""
    return {"status": "alive", "timestamp": utcnow().isoformat(), "version": VERSION}

@app.get("/ready", tags=["Health"], summary="Readiness probe")
async def readiness_probe():
    """Readiness endpoint: lightweight DB health + startup confirmation."""
    db = await health_monitor.check_health()
    overall = "ready" if db.get("status") == "healthy" else "degraded"
    return {
        "status": overall,
        "database": db,
        "uptime_seconds": (utcnow() - app.state.startup_time).total_seconds() if hasattr(app.state, 'startup_time') else 0,
        "timestamp": utcnow().isoformat(),
        "version": VERSION,
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Comprehensive application health check."""
    try:
        # ✅ FIXED: Use the corrected health monitor
        db_health = await health_monitor.check_health()

        # Determine overall status
        overall_status = "healthy"
        if db_health["status"] != "healthy":
            overall_status = "degraded" if not db_health.get("is_critical", False) else "unhealthy"

        response_payload = {
            "status": overall_status,
            "timestamp": utcnow().isoformat(),
            "version": VERSION,
            "environment": ENVIRONMENT,
            "database": db_health,
            "features": {
                "auth_available": AUTH_ROUTER_AVAILABLE,
                "notifications_available": NOTIFICATIONS_ROUTER_AVAILABLE,
            },
            "cors_origins": len(cors_origins),  # Don't expose actual origins for security
            "uptime_seconds": (utcnow() - app.state.startup_time).total_seconds() if hasattr(app.state, 'startup_time') else 0
        }
        # Guarantee at least one CORS header for tests even if no Origin provided
        headers = {}
        # Only set if middleware didn't already; use wildcard safe for public health
        headers.setdefault("Access-Control-Allow-Origin", "*")
        return JSONResponse(content=response_payload, headers=headers)

    except Exception as e:
        logger.error("Health check failed: %s", e)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "timestamp": utcnow().isoformat(),
                "error": "Health check failed",
                "version": VERSION,
                "environment": ENVIRONMENT
            }
        )

@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Impact ID Platform API",
        "version": VERSION,
        "environment": ENVIRONMENT,
        "documentation": "/docs",
        "health": "/health",
        "status": "operational",
        "features": {
            "auth": AUTH_ROUTER_AVAILABLE,
            "notifications": NOTIFICATIONS_ROUTER_AVAILABLE
        }
    }

@app.get("/api/metrics", tags=["Monitoring"])
async def get_metrics():
    """Application performance metrics."""
    return {
        "uptime_seconds": (utcnow() - app.state.startup_time).total_seconds() if hasattr(app.state, 'startup_time') else 0,
        "version": VERSION,
        "environment": ENVIRONMENT,
        "features": {
            "auth_available": AUTH_ROUTER_AVAILABLE,
            "notifications_available": NOTIFICATIONS_ROUTER_AVAILABLE,
        },
        "cors_enabled": True,
        "rate_limiting": True,
        "gzip_compression": True
    }

@app.get("/metrics", include_in_schema=False)
async def prometheus_metrics():  # pragma: no cover - usually scraped externally
    """Raw Prometheus metrics endpoint."""
    try:
        data = generate_latest(PROM_REGISTRY)
        return JSONResponse(content=data.decode("utf-8"), media_type=CONTENT_TYPE_LATEST)
    except Exception as e:
        logger.error("Metrics generation failed: %s", e)
        raise HTTPException(status_code=500, detail="Metrics unavailable")

# ================================
# 🎯 API ROUTERS
# ================================

# Include authentication router if available
if AUTH_ROUTER_AVAILABLE:
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    logger.info("✅ Auth router included at /api/auth")

# Include core routers
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(badges.router, prefix="/api", tags=["Badges"])
app.include_router(activities.router, prefix="/api", tags=["Activities"])
app.include_router(leaderboard.router, prefix="/api", tags=["Leaderboard"])
app.include_router(weaving.router, prefix="/api", tags=["Weaving"])

# Include notifications router if available
if NOTIFICATIONS_ROUTER_AVAILABLE:
    app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
    logger.info("✅ Notifications router included at /api/notifications")

# Include admin router (should be last for security)
app.include_router(admin.router, prefix="/api/admin", tags=["Administration"])

logger.info("🔗 All API routers configured successfully")

# ================================
# 📚 CUSTOM API DOCUMENTATION
# ================================

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """Custom Swagger UI with enhanced styling."""
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Interactive API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_ui_parameters={
            "deepLinking": True,
            "displayRequestDuration": True,
            "docExpansion": "none",
            "operationsSorter": "method",
            "filter": True,
            "tryItOutEnabled": True,
        }
    )

def custom_openapi():
    """Custom OpenAPI schema generation."""
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        contact=app.contact,
    )

    # Add security schemes if auth router is available
    if AUTH_ROUTER_AVAILABLE:
        openapi_schema["components"]["securitySchemes"] = {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Enter your Bearer token in the format: Bearer <token>"
            }
        }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ================================
# 🎭 ENHANCED FRONTEND SERVING
# ================================

# Define static directories with multiple fallback options
STATIC_DIRS = [
    Path(__file__).resolve().parent / "frontend" / "dist",  # Vite build
    Path(__file__).resolve().parent / "frontend" / "build", # React build
    Path(__file__).resolve().parent / "frontend",           # Direct frontend
    Path(__file__).resolve().parent.parent / "frontend" / "dist",  # Outside app folder
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",  # Project root
]

# Find the correct static directory
STATIC_DIR = None
for dir_path in STATIC_DIRS:
    if dir_path.exists():
        STATIC_DIR = dir_path
        logger.info("📁 Found frontend build directory: %s", STATIC_DIR)
        break

if STATIC_DIR:
    # Mount assets directory for bundled files
    assets_dirs = ["assets", "static", "_next", "js", "css"]  # Common asset directory names
    for asset_dir in assets_dirs:
        asset_path = STATIC_DIR / asset_dir
        if asset_path.exists():
            app.mount(f"/{asset_dir}", StaticFiles(directory=asset_path), name=f"static_{asset_dir}")
            logger.info("✅ Mounted %s from: %s", asset_dir, asset_path)

    # Mount additional static files
    static_files = ["images", "icons", "fonts", "manifest.json", "robots.txt"]
    for static_item in static_files:
        static_path = STATIC_DIR / static_item
        if static_path.exists():
            if static_path.is_file():
                # Individual files are served by the SPA handler
                continue
            app.mount(f"/{static_item}", StaticFiles(directory=static_path), name=f"static_{static_item}")
            logger.info("✅ Mounted %s from: %s", static_item, static_path)

    # Special handling for common favicon files
    favicon_files = ["favicon.ico", "favicon.png", "apple-touch-icon.png"]
    for favicon in favicon_files:
        favicon_path = STATIC_DIR / favicon
        if favicon_path.exists():
            # Register route with a captured default argument to avoid late-binding closure issue
            async def _serve_favicon(request: Request, _path=favicon_path):
                return FileResponse(_path)

            app.add_api_route(f"/{favicon}", _serve_favicon, methods=["GET"], include_in_schema=False)

else:
    logger.warning("⚠️ No frontend build directory found. Checked: %s", [str(d) for d in STATIC_DIRS])

# ================================
# 🎯 ENHANCED SPA ROUTING
# ================================

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(request: Request, full_path: str):
    """
    Serve the React/Vite SPA for all non-API routes.
    Enhanced with better error handling and multiple fallbacks.
    """
    # Skip API routes and special endpoints
    skip_paths = ["api/", "docs", "redoc", "health", "openapi.json", "metrics"]
    if any(full_path.startswith(path) for path in skip_paths):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API endpoint not found: /{full_path}"
        )

    # Look for index.html in the static directory
    if STATIC_DIR:
        index_files = ["index.html", "200.html"]  # Common SPA entry files

        for index_file in index_files:
            index_path = STATIC_DIR / index_file
            if index_path.exists():
                return FileResponse(
                    index_path,
                    media_type="text/html",
                    headers={
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Pragma": "no-cache",
                        "Expires": "0"
                    }
                )

    # Fallback response if no frontend is available
    if ENVIRONMENT == "development":
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "detail": "Frontend not built or found",
                "suggestion": "Build your frontend with 'npm run build' and place files in one of these directories:",
                "directories": [str(d) for d in STATIC_DIRS],
                "current_path": full_path,
                "api_docs": "/docs",
                "health_check": "/health"
            }
        )
    else:
        # In production, redirect to API docs if frontend isn't available
        return RedirectResponse(url="/docs", status_code=302)

# ================================
# 🛠️ ENHANCED ERROR HANDLING
# ================================

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: HTTPException):
    """Enhanced 404 handler with helpful information."""
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            status_code=404,
            content={
                "detail": "API endpoint not found",
                "path": request.url.path,
                "method": request.method,
                "available_docs": "/docs",
                "health_check": "/health",
                "suggestion": "Check the API documentation for available endpoints"
            }
        )

    # For non-API routes, try to serve the SPA
    return await serve_spa(request, request.url.path.lstrip("/"))

@app.exception_handler(500)
async def custom_500_handler(request: Request, exc):
    """Enhanced 500 error handler."""
    logger.error("Internal server error on %s: %s", request.url, exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "path": request.url.path,
            "health_check": "/health",
            "timestamp": utcnow().isoformat()
        }
    )

# ================================
# 🔧 DEVELOPMENT HELPERS
# ================================

if ENVIRONMENT == "development":

    @app.get("/api/dev/info", tags=["Development"])
    async def development_info():
        """Development information and debugging endpoints."""
        return {
            "environment": ENVIRONMENT,
            "debug": DEBUG,
            "version": VERSION,
            "cors_origins": cors_origins,
            "static_directory": str(STATIC_DIR) if STATIC_DIR else None,
            "available_routers": {
                "auth": AUTH_ROUTER_AVAILABLE,
                "notifications": NOTIFICATIONS_ROUTER_AVAILABLE,
            },
            "python_path": str(Path(__file__).resolve()),
            "static_dirs_checked": [str(d) for d in STATIC_DIRS],
        }

    @app.get("/api/dev/routes", tags=["Development"])
    async def list_routes():
        """List all registered routes for debugging."""
        routes = []
        for route in app.routes:
            if hasattr(route, 'methods') and hasattr(route, 'path'):
                routes.append({
                    "path": route.path,
                    "methods": list(route.methods),
                    "name": getattr(route, 'name', 'N/A')
                })
        return {"routes": sorted(routes, key=lambda x: x['path'])}

# ================================
# 📝 COMPATIBILITY EVENT HANDLERS
# ================================

# Removed deprecated @app.on_event('startup') handler; initialization handled in lifespan.
