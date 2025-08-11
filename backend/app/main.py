import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .core.config import get_settings
from .core.logging import setup_logging, get_logger
from .core.database import init_db, close_db
from .api.v1 import products

setup_logging()
logger = get_logger(__name__)

settings = get_settings()

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting application - App Name: {settings.app_name}, Version: {settings.app_version}")
    
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database - Error: {str(e)}")
        raise
    
    yield
    
    logger.info("Shutting down application")
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A modern, scalable product management API built with FastAPI",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allowed_headers,
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.debug else ["localhost", "127.0.0.1"]
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request started - Method: {request.method}, URL: {str(request.url)}, Client IP: {request.client.host if request.client else None}, User Agent: {request.headers.get('user-agent')}"
    )
    
    try:
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Request completed - Method: {request.method}, URL: {str(request.url)}, Status Code: {response.status_code}, Process Time: {process_time}"
        )
        
        return response
        
    except Exception as e:
        # Log error
        process_time = time.time() - start_time
        logger.error(
            f"Request failed - Method: {request.method}, URL: {str(request.url)}, Error: {str(e)}, Process Time: {process_time}"
        )
        raise


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception - Method: {request.method}, URL: {str(request.url)}, Error: {str(exc)}",
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error_type": type(exc).__name__
        }
    )


# Health check endpoint
@app.get(
    "/health", 
    tags=["health"],
    summary="Health check endpoint",
    description="Check the health status of the application and its dependencies.",
    response_description="Application health status"
)
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": time.time()
    }


# Root endpoint
@app.get(
    "/", 
    tags=["root"],
    summary="Root endpoint with API information",
    description="Get basic information about the API and available endpoints.",
    response_description="API information and available endpoints"
)
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "environment": settings.environment,
        "docs_url": "/docs" if settings.debug else None,
        "health_check": "/health",
        "endpoints": {
        }
    }


# Include API routers
app.include_router(products.router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower()
    ) 