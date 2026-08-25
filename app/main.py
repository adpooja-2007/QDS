"""
FastAPI Main Application Entry Point for Module 2 Threat Detection Engine.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.engine.exceptions import ThreatEngineException
from app.api.routes import router as security_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Deterministic Statistical Threat Detection Engine for Quantum Key Distribution (QKD) Security Analysis.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend dashboard integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ThreatEngineException)
async def threat_engine_exception_handler(request: Request, exc: ThreatEngineException):
    """Global exception handler for Threat Engine domain exceptions."""
    return JSONResponse(
        status_code=400,
        content={
            "status": "INVALID_INPUT",
            "error_code": exc.code,
            "message": exc.message,
            "field": exc.field,
        },
    )


# Include API Router
app.include_router(security_router)


@app.get("/", include_in_schema=False)
def root():
    """Root redirect endpoint to API documentation."""
    return {
        "module": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
