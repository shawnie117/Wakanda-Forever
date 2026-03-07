"""
VIBRANIUM AI API - Main Application
FastAPI service for AI-powered product intelligence
"""

import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv

from api.routes import router, initialize_pipelines
from services.scheduler import PipelineScheduler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

scheduler = None


# Load environment variables from ai/.env if present
AI_ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=AI_ROOT_DIR / ".env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("="*60)
    logger.info("VIBRANIUM AI API - Starting Up")
    logger.info("="*60)
    
    success = initialize_pipelines()
    
    if success:
        logger.info("✓ All pipelines initialized successfully")

        try:
            from api import routes as routes_module

            data_pipeline_service = getattr(routes_module, "data_pipeline_service", None)
            if data_pipeline_service is not None:
                global scheduler
                scheduler = PipelineScheduler(data_pipeline_service=data_pipeline_service)
                scheduler.start()
        except Exception as error:
            logger.warning("Daily scheduler startup skipped: %s", str(error))
    else:
        logger.warning("⚠ Some pipelines failed to initialize")
    
    logger.info("="*60)
    logger.info("API is ready to accept requests")
    logger.info("="*60)
    
    yield
    
    # Shutdown
    if scheduler is not None:
        scheduler.shutdown()
    logger.info("Shutting down VIBRANIUM AI API...")


# Create FastAPI app
app = FastAPI(
    title="VIBRANIUM AI API",
    description="""
    ## AI-Powered Product Intelligence Platform
    
    VIBRANIUM provides comprehensive product analysis and competitor intelligence using state-of-the-art AI models.
    
    ### Features:
    - **Sentiment Analysis**: Analyze customer sentiment using lexical scoring
    - **Feature Extraction**: Extract product features using rule-based signals
    - **AI Insights**: Generate strategic insights using Groq chat models
    - **Competitor Analysis**: Compare products and identify competitive gaps
    
    ### Technology Stack:
    - **Sentiment Engine**: lexical scoring pipeline
    - **Feature Engine**: rule-based extraction
    - **LLM**: Groq-hosted model (configurable via GROQ_MODEL)
    - **Framework**: FastAPI + Groq API client
    
    ### Endpoints:
    - `POST /analyze-product`: Analyze a product based on reviews
    - `POST /compare-products`: Compare target product with competitors
    - `GET /health`: Service health check
    - `GET /models/status`: Check AI model loading status
    
    ---
    **Team**: Wakanda Forever | **Institution**: CHRIST University Lavasa
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS — accept all localhost ports so Vite auto-port never blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information
    """
    return {
        "service": "VIBRANIUM AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "team": "Wakanda Forever",
        "institution": "CHRIST University Lavasa",
        "endpoints": {
            "analyze_product": "/api/v1/analyze-product",
            "compare_products": "/api/v1/compare-products",
            "health": "/api/v1/health",
            "models_status": "/api/v1/models/status"
        }
    }


@app.get("/favicon.ico")
async def favicon():
    """Handle favicon requests"""
    return {"message": "No favicon"}


if __name__ == "__main__":
    """
    Run the API server
    
    Usage:
        python main.py
        
    Or with uvicorn directly:
        uvicorn main:app --reload --host 0.0.0.0 --port 8000
    """
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
