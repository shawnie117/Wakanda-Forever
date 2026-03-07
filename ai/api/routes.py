"""
API Routes for VIBRANIUM AI Service
"""

import logging
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from api.schemas import (
    AnalyzeProductRequest,
    AnalyzeProductResponse,
    CompareProductsRequest,
    CompareProductsResponse,
    HealthCheckResponse,
    ErrorResponse,
    CollectDataRequest,
    CollectDataResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    ExtractKeywordsRequest,
    KeywordResponse,
    CompetitorDiscoveryRequest,
    CompetitorDiscoveryResponse,
    SheetDataResponse,
    MarketAnalysisResponse,
    ChatRequest,
    ChatResponse,
)
from pipelines.analysis_pipeline import AnalysisPipeline
from pipelines.competitor_pipeline import CompetitorPipeline
from services.data_pipeline import DataPipelineService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Global pipeline instances (loaded once at startup)
analysis_pipeline = None
competitor_pipeline = None
data_pipeline_service = None


def initialize_pipelines():
    """Initialize AI pipelines"""
    global analysis_pipeline, competitor_pipeline, data_pipeline_service
    
    try:
        logger.info("Initializing AI pipelines...")
        analysis_pipeline = AnalysisPipeline()
        competitor_pipeline = CompetitorPipeline()
        data_pipeline_service = DataPipelineService()
        logger.info("✓ Pipelines initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize pipelines: {str(e)}")
        return False


@router.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify service status
    """
    models_loaded = {
        "analysis_pipeline": analysis_pipeline is not None,
        "competitor_pipeline": competitor_pipeline is not None
    }
    
    return {
        "status": "healthy" if all(models_loaded.values()) else "degraded",
        "version": "1.0.0",
        "models_loaded": models_loaded
    }


@router.post(
    "/analyze-product",
    response_model=AnalyzeProductResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    tags=["Analysis"]
)
async def analyze_product(request: AnalyzeProductRequest):
    """
    Analyze a product based on reviews
    
    Performs:
    - Sentiment analysis using lexical pipeline
    - Feature extraction using rule-based signals
    - AI insight generation using Groq chat models (with local fallback)
    
    Returns comprehensive analysis with sentiment scores, extracted features,
    and strategic AI-generated insights.
    """
    try:
        if analysis_pipeline is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Analysis pipeline not initialized"
            )
        
        # Convert Pydantic models to dictionaries
        reviews = [review.model_dump() for review in request.reviews]
        metadata = request.metadata.model_dump() if request.metadata else {}
        
        # Run analysis
        logger.info(f"Analyzing product: {request.product_name}")
        result = analysis_pipeline.analyze_product(
            product_name=request.product_name,
            reviews=reviews,
            product_metadata=metadata
        )
        
        # Check for errors
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        logger.info(f"✓ Analysis complete for {request.product_name}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post(
    "/compare-products",
    response_model=CompareProductsResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    tags=["Comparison"]
)
async def compare_products(request: CompareProductsRequest):
    """
    Compare a target product with competitors
    
    Performs:
    - Feature gap analysis
    - Price comparison
    - Sentiment comparison
    - AI competitive insights generation
    
    Returns comprehensive competitor analysis with identified gaps,
    market positioning, and strategic recommendations.
    """
    try:
        if competitor_pipeline is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Competitor pipeline not initialized"
            )
        
        # Validate input
        if not request.competitors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one competitor must be provided"
            )
        
        # Convert to dictionaries
        target = request.target_product.model_dump()
        competitors = [comp.model_dump() for comp in request.competitors]
        
        # Run comparison
        logger.info(f"Comparing {target['productName']} with {len(competitors)} competitors")
        result = competitor_pipeline.compare_products(
            target_product=target,
            competitors=competitors
        )
        
        # Check for errors
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        logger.info(f"✓ Comparison complete")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Comparison failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comparison failed: {str(e)}"
        )


@router.get("/models/status", tags=["Models"])
async def get_models_status():
    """
    Get status of loaded AI models
    """
    status_info = {
        "analysis_pipeline": {
            "loaded": analysis_pipeline is not None,
            "components": {
                "sentiment_analyzer": analysis_pipeline.sentiment_analyzer is not None if analysis_pipeline else False,
                "feature_extractor": analysis_pipeline.feature_extractor is not None if analysis_pipeline else False,
                "insight_generator": analysis_pipeline.insight_generator is not None if analysis_pipeline else False
            } if analysis_pipeline else {}
        },
        "competitor_pipeline": {
            "loaded": competitor_pipeline is not None,
            "components": {
                "insight_generator": competitor_pipeline.insight_generator is not None if competitor_pipeline else False
            } if competitor_pipeline else {}
        }
    }
    
    return status_info


@router.post(
    "/collect-data",
    response_model=CollectDataResponse,
    tags=["Data Pipeline"],
)
async def collect_data(request: CollectDataRequest):
    """
    Collect reviews/opinions from live sources, run NLP enrichment,
    and store records in Google Sheets (with fallback storage).
    """
    try:
        if data_pipeline_service is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Data pipeline service not initialized",
            )

        result = data_pipeline_service.collect_data(
            product_name=request.product_name,
            region=request.region or "Global",
            max_items_per_source=request.max_items_per_source or 20,
            competitors=request.competitors or [],
        )
        return result
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Collect-data failed: %s", str(error))
        raise HTTPException(status_code=500, detail=f"Collect-data failed: {str(error)}")


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    tags=["Data Pipeline"],
)
async def analyze(request: AnalyzeRequest):
    """
    Run sentiment + keyword + feature/competitor enrichment on provided reviews.
    """
    try:
        if data_pipeline_service is None:
            raise HTTPException(status_code=503, detail="Data pipeline service not initialized")

        result = data_pipeline_service.analyze_texts(
            product_name=request.product_name,
            texts=request.reviews,
            region=request.region or "Global",
            competitors=request.competitors or [],
        )
        return result
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Analyze failed: %s", str(error))
        raise HTTPException(status_code=500, detail=f"Analyze failed: {str(error)}")


@router.post(
    "/extract-keywords",
    response_model=KeywordResponse,
    tags=["Data Pipeline"],
)
async def extract_keywords(request: ExtractKeywordsRequest):
    """
    Extract keyword phrases from text.
    """
    try:
        if data_pipeline_service is None:
            raise HTTPException(status_code=503, detail="Data pipeline service not initialized")

        return data_pipeline_service.extract_keywords(text=request.text, top_k=request.top_k or 8)
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Keyword extraction failed: %s", str(error))
        raise HTTPException(status_code=500, detail=f"Keyword extraction failed: {str(error)}")


@router.post(
    "/competitor-discovery",
    response_model=CompetitorDiscoveryResponse,
    tags=["Data Pipeline"],
)
async def competitor_discovery(request: CompetitorDiscoveryRequest):
    """
    Compute competitor similarity from text embeddings (with fallback).
    """
    try:
        if data_pipeline_service is None:
            raise HTTPException(status_code=503, detail="Data pipeline service not initialized")

        return data_pipeline_service.discover_competitors(text=request.text, candidates=request.candidates)
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Competitor discovery failed: %s", str(error))
        raise HTTPException(status_code=500, detail=f"Competitor discovery failed: {str(error)}")


@router.get(
    "/sheet-data",
    response_model=SheetDataResponse,
    tags=["Data Pipeline"],
)
async def sheet_data(product: Optional[str] = None, limit: Optional[int] = None):
    """
    Return stored records from Google Sheets (or fallback storage).
    """
    try:
        if data_pipeline_service is None:
            raise HTTPException(status_code=503, detail="Data pipeline service not initialized")

        return data_pipeline_service.get_sheet_data(product=product, limit=limit)
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Sheet-data failed: %s", str(error))
        raise HTTPException(status_code=500, detail=f"Sheet-data failed: {str(error)}")


@router.get(
    "/market-analysis",
    response_model=MarketAnalysisResponse,
    tags=["Data Pipeline"],
)
async def market_analysis(product: Optional[str] = None):
    """
    Return aggregated market intelligence metrics for map/dashboard widgets.
    """
    try:
        if data_pipeline_service is None:
            raise HTTPException(status_code=503, detail="Data pipeline service not initialized")

        return data_pipeline_service.get_market_analysis(product=product)
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Market-analysis failed: %s", str(error))
        raise HTTPException(status_code=500, detail=f"Market-analysis failed: {str(error)}")


@router.post(
    "/chat",
    response_model=ChatResponse,
    tags=["AI Chat"],
)
async def chat(request: ChatRequest):
    """
    AI Chat endpoint — sends the user message + conversation history to Groq LLaMA
    and returns a direct conversational reply.
    """
    import os
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

    system_prompt = (
        "You are VIBRANIUM, an expert AI Product Intelligence Assistant. "
        "You help product teams understand customer sentiment, analyze competitor positioning, "
        "identify feature gaps, and generate actionable improvement strategies. "
        "Be concise, direct, and data-driven. When asked general questions about yourself, "
        "explain your capabilities in 1-2 sentences. "
        "When asked product questions, give specific, practical recommendations."
    )

    if request.context:
        system_prompt += f"\n\nProduct Context: {request.context}"

    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 10 messages to stay within token limits)
    for msg in (request.history or [])[-10:]:
        messages.append({"role": msg.role, "content": msg.content})

    # Add current user message
    messages.append({"role": "user", "content": request.message})

    if not groq_api_key:
        # Deterministic fallback when no API key is set
        fallback_reply = _chat_fallback(request.message)
        return {"reply": fallback_reply, "generated_by": "fallback"}

    try:
        from groq import Groq  # type: ignore
        client = Groq(api_key=groq_api_key)
        response = client.chat.completions.create(
            model=groq_model,
            messages=messages,
            temperature=0.5,
            max_tokens=512,
        )
        reply = (response.choices[0].message.content or "").strip()
        if not reply:
            reply = _chat_fallback(request.message)
            generated_by = "fallback"
        else:
            generated_by = "groq"
    except Exception as error:
        logger.warning("Groq chat failed, using fallback: %s", str(error))
        reply = _chat_fallback(request.message)
        generated_by = "fallback"

    return {"reply": reply, "generated_by": generated_by}


def _chat_fallback(message: str) -> str:
    """Rule-based reply when Groq is unavailable."""
    msg = (message or "").lower().strip()
    if any(token in msg for token in ["who are you", "what are you", "your name"]):
        return (
            "I'm VIBRANIUM AI, your product intelligence assistant. "
            "I can help you understand customer sentiment, compare competitors, "
            "identify feature gaps, and surface strategic improvement opportunities."
        )
    if any(token in msg for token in ["sentiment", "score", "rating"]):
        return (
            "Sentiment scores reflect the ratio of positive to negative customer signals across your reviews. "
            "Scores above 75 indicate strong satisfaction; below 50 suggests significant improvement areas. "
            "Focus on the top 2–3 recurring complaint themes first for the fastest lift."
        )
    if any(token in msg for token in ["competitor", "compare", "rival", "vs"]):
        return (
            "To close competitive gaps, prioritize matching top competitor features that appear in 2+ rival products. "
            "Focus on differentiated positioning in your strongest feature area and improve comparison messaging."
        )
    if any(token in msg for token in ["feature", "improve", "add", "missing"]):
        return (
            "Identify the highest-frequency feature gap mentioned across competitor listings, "
            "then validate demand through user surveys before committing to roadmap. "
            "Incremental releases with feedback loops outperform large batch feature drops."
        )
    if any(token in msg for token in ["price", "pricing", "cost"]):
        return (
            "Pricing strategy should balance perceived value vs competitor benchmarks. "
            "Test a tiered offer (e.g., value vs premium) and track conversion and retention metrics "
            "to find the optimal price point without sacrificing customer satisfaction."
        )
    return (
        "Great question! Run a product analysis to get data-driven insights. "
        "You can ask me about sentiment, feature gaps, competitor positioning, pricing strategy, "
        "or customer pain points — I'll give you specific recommendations based on your product data."
    )
