"""
Main module for Impact ID application.
"""


from datetime import datetime
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

from app.database import create_tables, startup_database, shutdown_database, health_monitor
from app.routers import auth
from app.routers import notifications
from app.routers import users, tasks, admin, activities, badges, leaderboard, weaving


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

# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/impact_id.log') if Path('logs').exists() else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)

# Environment settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
VERSION = "2.0.0"

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
    startup_time = datetime.utcnow()
    logger.info("🚀 Starting Impact ID Application...")

    try:
        # Initialize database
        logger.info("📊 Initializing database...")
        await startup_database()

        # Perform health check
        logger.info("🏥 Performing startup health check...")
        health_status = await health_monitor.check_health()
        if health_status["status"] != "healthy":
            logger.warning("⚠️ Health check warning: %s", health_status)

        startup_duration = (datetime.utcnow() - startup_time).total_seconds()
        logger.info("✅ Application startup completed in %.2f seconds", startup_duration)
        logger.info("🌍 Environment: %s", ENVIRONMENT)
        logger.info("🔗 API Documentation: http://localhost:8000/docs")

        # Store startup time in app state
        app.state.startup_time = startup_time

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

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = (
        "connect-src 'self' https://api.impactid.xyz wss://api.impactid.xyz ws://localhost:8000 http://localhost:8000 http://127.0.0.1:8000;"
        " frame-ancestors 'none';"
    )
    return response

# ================================
# 🏥 HEALTH & MONITORING
# ================================

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

        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "version": VERSION,
            "environment": ENVIRONMENT,
            "database": db_health,
            "features": {
                "auth_available": AUTH_ROUTER_AVAILABLE,
                "notifications_available": NOTIFICATIONS_ROUTER_AVAILABLE,
            },
            "cors_origins": len(cors_origins),  # Don't expose actual origins for security
            "uptime_seconds": (datetime.utcnow() - app.state.startup_time).total_seconds() if hasattr(app.state, 'startup_time') else 0
        }

    except Exception as e:
        logger.error("Health check failed: %s", e)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
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
        "uptime_seconds": (datetime.utcnow() - app.state.startup_time).total_seconds() if hasattr(app.state, 'startup_time') else 0,
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
            "timestamp": datetime.utcnow().isoformat()
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

# Fallback startup handler for compatibility
@app.on_event("startup")
async def on_startup():
    """Fallback startup event handler."""
    if not hasattr(app.state, 'startup_time'):
        app.state.startup_time = datetime.utcnow()
        logger.info("📊 Initializing database tables...")
        await create_tables()
        logger.info("✅ Database tables checked/created successfully")

        logger.info("=" * 80)
        logger.info("🌟 IMPACT ID PLATFORM API")
        logger.info("=" * 80)
        logger.info("📱 Version: %s", VERSION)
        logger.info("🌍 Environment: %s", ENVIRONMENT)
        logger.info("🔧 Debug Mode: %s", DEBUG)
        logger.info("🔗 API Docs: http://localhost:8000/docs")
        logger.info("🏥 Health Check: http://localhost:8000/health")
        logger.info("📁 Static Dir: %s", STATIC_DIR)
