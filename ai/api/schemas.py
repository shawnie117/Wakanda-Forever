"""
Pydantic schemas for API request and response validation
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class Review(BaseModel):
    """Single product review"""
    reviewId: Optional[str] = Field(None, description="Unique review identifier")
    text: str = Field(..., description="Review text content")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating (1-5 stars)")
    date: Optional[str] = Field(None, description="Review date")
    verified: Optional[bool] = Field(None, description="Whether review is verified")


class ProductMetadata(BaseModel):
    """Product metadata"""
    price: Optional[float] = Field(None, description="Product price")
    category: Optional[str] = Field(None, description="Product category")
    brand: Optional[str] = Field(None, description="Product brand")


class AnalyzeProductRequest(BaseModel):
    """Request schema for product analysis"""
    product_name: str = Field(..., description="Name of the product to analyze")
    reviews: List[Review] = Field(..., description="List of product reviews")
    metadata: Optional[ProductMetadata] = Field(None, description="Optional product metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "product_name": "Samsung Galaxy M35",
                "reviews": [
                    {
                        "reviewId": "rev_001",
                        "text": "Amazing phone with great camera and battery life!",
                        "rating": 5,
                        "verified": True
                    },
                    {
                        "reviewId": "rev_002",
                        "text": "Good phone but heats up during gaming.",
                        "rating": 3,
                        "verified": True
                    }
                ],
                "metadata": {
                    "price": 18999,
                    "category": "Electronics",
                    "brand": "Samsung"
                }
            }
        }


class CompetitorData(BaseModel):
    """Competitor product data"""
    productName: str = Field(..., description="Competitor product name")
    price: Optional[float] = Field(None, description="Product price")
    sentimentScore: Optional[float] = Field(None, ge=0, le=100, description="Sentiment score (0-100)")
    avgRating: Optional[float] = Field(None, ge=0, le=5, description="Average rating (0-5)")
    features: List[str] = Field(default_factory=list, description="List of product features")


class CompareProductsRequest(BaseModel):
    """Request schema for competitor comparison"""
    target_product: CompetitorData = Field(..., description="Target product to analyze")
    competitors: List[CompetitorData] = Field(..., description="List of competitor products")
    
    class Config:
        json_schema_extra = {
            "example": {
                "target_product": {
                    "productName": "Samsung Galaxy M35",
                    "price": 18999,
                    "sentimentScore": 75,
                    "avgRating": 3.9,
                    "features": ["5G", "AMOLED display", "6000mAh battery", "50MP camera"]
                },
                "competitors": [
                    {
                        "productName": "Xiaomi Redmi Note 13 Pro",
                        "price": 17999,
                        "sentimentScore": 82,
                        "avgRating": 4.3,
                        "features": ["5G", "AMOLED screen", "5000mAh battery", "200MP camera", "67W fast charging"]
                    }
                ]
            }
        }


class SentimentAnalysis(BaseModel):
    """Sentiment analysis results"""
    overall_score: float = Field(..., description="Overall sentiment score (0-100)")
    sentiment_summary: str = Field(..., description="Human-readable sentiment summary")
    total_reviews: int = Field(..., description="Total number of reviews analyzed")
    distribution: Dict[str, float] = Field(..., description="Sentiment distribution percentages")
    counts: Dict[str, int] = Field(..., description="Count of positive/negative/neutral reviews")


class FeatureAnalysis(BaseModel):
    """Feature extraction results"""
    extracted_features: List[str] = Field(..., description="List of extracted features")
    feature_summary: Dict[str, Any] = Field(..., description="Detailed feature summary by category")
    top_categories: List[Dict[str, Any]] = Field(..., description="Top feature categories by mentions")
    total_mentions: int = Field(..., description="Total feature mentions across all reviews")


class AIInsights(BaseModel):
    """AI-generated insights"""
    insights_text: str = Field(..., description="Generated insights text")
    recommendation_type: str = Field(..., description="Recommendation category")
    generated_by: str = Field(..., description="Model used for generation (groq/fallback)")


class AnalysisMetadata(BaseModel):
    """Analysis metadata"""
    total_reviews_analyzed: int = Field(..., description="Number of reviews processed")
    pipeline_version: str = Field(..., description="Pipeline version used")


class AnalyzeProductResponse(BaseModel):
    """Response schema for product analysis"""
    product_name: str = Field(..., description="Analyzed product name")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Product metadata")
    sentiment_analysis: SentimentAnalysis = Field(..., description="Sentiment analysis results")
    feature_analysis: FeatureAnalysis = Field(..., description="Feature extraction results")
    ai_insights: AIInsights = Field(..., description="AI-generated insights")
    analysis_metadata: AnalysisMetadata = Field(..., description="Analysis metadata")


class FeatureGaps(BaseModel):
    """Feature gap analysis"""
    gaps_identified: List[str] = Field(..., description="List of missing features")
    total_gaps: int = Field(..., description="Total number of gaps")
    priority: List[Dict[str, Any]] = Field(..., description="Prioritized feature gaps")


class PriceComparison(BaseModel):
    """Price comparison analysis"""
    target_price: float = Field(..., description="Target product price")
    position: str = Field(..., description="Price position (budget/competitive/premium)")
    price_range: Dict[str, float] = Field(..., description="Competitor price range")
    price_difference_from_avg: float = Field(..., description="Difference from average price")
    price_percentile: float = Field(..., description="Price percentile position")


class SentimentComparison(BaseModel):
    """Sentiment comparison results"""
    target_sentiment: float = Field(..., description="Target product sentiment score")
    rank: int = Field(..., description="Rank among all products")
    total_products: int = Field(..., description="Total products compared")
    competitors: List[Dict[str, Any]] = Field(..., description="Competitor sentiment data")
    average_competitor_sentiment: float = Field(..., description="Average competitor sentiment")
    difference_from_average: float = Field(..., description="Difference from average")
    position: str = Field(..., description="Sentiment position category")


class FeatureComparison(BaseModel):
    """Feature comparison results"""
    target_feature_count: int = Field(..., description="Number of features in target product")
    average_competitor_count: float = Field(..., description="Average competitor feature count")
    competitor_counts: List[Dict[str, Any]] = Field(..., description="Feature counts by competitor")
    common_features: List[str] = Field(..., description="Features common across all products")
    common_feature_count: int = Field(..., description="Number of common features")
    position: str = Field(..., description="Feature position (above_average/below_average)")


class OverallPosition(BaseModel):
    """Overall competitive position"""
    overall_score: float = Field(..., description="Overall competitive score (0-100)")
    tier: str = Field(..., description="Competitive tier")
    rank: int = Field(..., description="Overall rank")
    total_products: int = Field(..., description="Total products in comparison")
    strengths: List[str] = Field(..., description="Product strengths")
    weaknesses: List[str] = Field(..., description="Product weaknesses")


class CompetitiveInsights(BaseModel):
    """Competitive insights from AI"""
    competitive_insights: str = Field(..., description="AI-generated competitive insights")
    market_position: str = Field(..., description="Market position assessment")
    feature_gaps: List[str] = Field(..., description="Identified feature gaps")
    generated_by: str = Field(..., description="Model used for generation")


class CompareProductsResponse(BaseModel):
    """Response schema for competitor comparison"""
    target_product: Dict[str, Any] = Field(..., description="Target product summary")
    competitors_analyzed: int = Field(..., description="Number of competitors analyzed")
    feature_gaps: FeatureGaps = Field(..., description="Feature gap analysis")
    price_comparison: PriceComparison = Field(..., description="Price comparison analysis")
    sentiment_comparison: SentimentComparison = Field(..., description="Sentiment comparison")
    feature_comparison: FeatureComparison = Field(..., description="Feature comparison")
    competitive_insights: CompetitiveInsights = Field(..., description="AI competitive insights")
    overall_position: OverallPosition = Field(..., description="Overall competitive position")


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    models_loaded: Dict[str, bool] = Field(..., description="Model loading status")


class ErrorResponse(BaseModel):
    """Error response"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")


class CollectDataRequest(BaseModel):
    """Request schema for live data collection"""
    product_name: str = Field(..., description="Product name to collect reviews for")
    region: Optional[str] = Field("Global", description="Region label for collected records")
    max_items_per_source: Optional[int] = Field(20, ge=1, le=100, description="Maximum items to fetch per source")
    competitors: Optional[List[str]] = Field(default_factory=list, description="Competitor names for similarity scoring")


class AnalyzeRequest(BaseModel):
    """Request schema for text analysis"""
    product_name: str = Field(..., description="Product name")
    reviews: List[str] = Field(default_factory=list, description="Review text list")
    region: Optional[str] = Field("Global", description="Region label")
    competitors: Optional[List[str]] = Field(default_factory=list, description="Competitor names")


class ExtractKeywordsRequest(BaseModel):
    """Request schema for keyword extraction"""
    text: str = Field(..., description="Source text")
    top_k: Optional[int] = Field(8, ge=1, le=30, description="Keyword count")


class CompetitorDiscoveryRequest(BaseModel):
    """Request schema for competitor similarity"""
    text: str = Field(..., description="Input text")
    candidates: List[str] = Field(default_factory=list, description="Candidate competitor names")


class DataRecord(BaseModel):
    """Stored data record"""
    product: str
    source: str
    review: str
    sentiment: str
    positive_score: float
    negative_score: float
    keywords: str
    date: str
    region: str


class CollectDataResponse(BaseModel):
    """Response schema for collect-data endpoint"""
    product: str
    region: str
    collected: int
    stored: int
    storage: str
    records: List[Dict[str, Any]]


class AnalyzeResponse(BaseModel):
    """Response schema for analyze endpoint"""
    product: str
    analyzed: int
    records: List[Dict[str, Any]]


class KeywordResponse(BaseModel):
    """Response schema for extract-keywords endpoint"""
    keywords: List[str]
    count: int


class CompetitorDiscoveryResponse(BaseModel):
    """Response schema for competitor-discovery endpoint"""
    top_matches: List[Dict[str, Any]]
    all_scores: Dict[str, float]


class SheetDataResponse(BaseModel):
    """Response schema for sheet-data endpoint"""
    source: str
    count: int
    rows: List[DataRecord]


class MarketRegionMetrics(BaseModel):
    """Regional market metrics"""
    region: str
    review_volume: int
    sentiment_score: float
    adoption_score: float
    popularity_score: float
    competitor_density: float
    growth_indicator: float
    opportunity: str


class MarketAnalysisResponse(BaseModel):
    """Response schema for market analysis endpoint"""
    product_filter: Optional[str]
    data_source: str
    record_count: int
    market_intelligence: Dict[str, Any]


class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Request schema for the AI chat endpoint"""
    message: str = Field(..., description="User's current message")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Conversation history")
    context: Optional[str] = Field(None, description="Optional product context")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Why is our sentiment low?",
                "history": [
                    {"role": "assistant", "content": "Hello! How can I help you?"}
                ],
                "context": "Product: Camlin Scissors, Sentiment: 51/100"
            }
        }


class ChatResponse(BaseModel):
    """Response schema for the AI chat endpoint"""
    reply: str = Field(..., description="AI assistant reply")
    generated_by: str = Field(..., description="Model used for generation")
