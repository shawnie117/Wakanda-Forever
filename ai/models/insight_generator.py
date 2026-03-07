"""
AI Insight Generation Module
Groq-only research and insight generation with deterministic fallback.
"""

import logging
import os
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class InsightGenerator:
    """
    Generate strategic insights using Groq chat models.
    """

    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

        self.client = None
        self.model_loaded = False
        self._load_groq_client()

    def _load_groq_client(self):
        if not self.groq_api_key:
            logger.warning("GROQ_API_KEY missing; AI generation will use rule-based fallback")
            return

        try:
            from groq import Groq  # type: ignore

            self.client = Groq(api_key=self.groq_api_key)
            self.model_loaded = True
            logger.info("✓ Groq configured with model: %s", self.groq_model)
        except Exception as error:
            logger.warning("Groq client unavailable; fallback enabled: %s", str(error))

    def _call_groq(self, prompt: str, max_tokens: int = 320, temperature: float = 0.3) -> str:
        if not self.client:
            raise RuntimeError("Groq client not initialized")

        response = self.client.chat.completions.create(
            model=self.groq_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a concise product intelligence analyst. Return practical, specific guidance.",
                },
                {
                    "role": "user",
                    "content": prompt[:9000],
                },
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )

        text = (response.choices[0].message.content or "").strip()
        if not text:
            raise RuntimeError("Groq returned empty content")
        return text

    def _generate_structured_product_fallback(
        self,
        product_name: str,
        sentiment_score: float,
        features: List[str],
        review_summary: Dict[str, Any],
    ) -> str:
        total_reviews = int(review_summary.get("total_reviews", 0) or 0)
        positive_count = int(review_summary.get("positive_count", 0) or 0)
        negative_count = int(review_summary.get("negative_count", 0) or 0)
        key_features = features[:5] if features else ["quality", "price", "usability"]

        if sentiment_score >= 75:
            health = "strong"
            priority = "Scale strengths while resolving minor friction points"
        elif sentiment_score >= 60:
            health = "stable"
            priority = "Improve consistency and reduce repeated complaint themes"
        elif sentiment_score >= 40:
            health = "mixed"
            priority = "Prioritize trust, value communication, and quality clarity"
        else:
            health = "at risk"
            priority = "Run immediate corrective actions on top negative drivers"

        return (
            f"Overall Assessment:\n"
            f"{product_name} is in a {health} sentiment zone ({sentiment_score:.1f}/100) across {total_reviews} reviews. "
            f"Primary focus should be: {priority}.\n\n"
            f"Customer Signal Summary:\n"
            f"- Most discussed feature areas: {', '.join(key_features)}\n"
            f"- Positive vs negative split: {positive_count} positive / {negative_count} negative\n"
            f"- Market perception shows strong attention on quality-performance-value balance\n\n"
            f"Recommended Next Moves (30-60 days):\n"
            f"1. Fix the top 2 complaint clusters and track weekly sentiment delta\n"
            f"2. Strengthen messaging around the strongest 2 user-valued features\n"
            f"3. Validate improvements with post-purchase survey and review tagging"
        )

    def _generate_structured_competitor_fallback(
        self,
        product_data: Dict[str, Any],
        competitors: List[Dict[str, Any]],
        feature_gaps: List[str],
    ) -> str:
        product_name = product_data.get("productName", "Our Product")
        product_score = float(product_data.get("sentimentScore", 0) or 0)
        product_price = float(product_data.get("price", 0) or 0)

        competitor_scores = [float(item.get("sentimentScore", 0) or 0) for item in competitors]
        average_score = (sum(competitor_scores) / len(competitor_scores)) if competitor_scores else 0.0
        delta = product_score - average_score

        if delta >= 5:
            position = "ahead of competitor average"
        elif delta >= -5:
            position = "near competitor average"
        else:
            position = "behind competitor average"

        top_gaps = feature_gaps[:5]

        return (
            f"Competitive Position:\n"
            f"{product_name} is {position} with sentiment {product_score:.1f} vs competitor average {average_score:.1f}. "
            f"Current listed price is ${product_price:.2f}.\n\n"
            f"Key Wins:\n"
            f"- Competitive baseline on customer satisfaction\n"
            f"- Clear core value proposition in current feature set\n"
            f"- Good potential to convert comparison shoppers with stronger proof points\n\n"
            f"Primary Risks:\n"
            f"- Missing competitor features: {', '.join(top_gaps) if top_gaps else 'No major feature gap detected'}\n"
            f"- Gaps in differentiation narrative vs top ranked competitor\n"
            f"- Value communication can be improved for price-sensitive segments\n\n"
            f"Strategy Actions:\n"
            f"1. Prioritize top 2 high-frequency competitor features in roadmap\n"
            f"2. Improve comparison messaging with measurable customer outcomes\n"
            f"3. Strengthen pricing narrative around delivered value"
        )

    def _build_product_prompt(
        self,
        product_name: str,
        sentiment_score: float,
        features: List[str],
        review_summary: Dict[str, Any],
    ) -> str:
        return f"""
Create a concise product intelligence brief.

Product: {product_name}
Sentiment Score: {sentiment_score}/100
Top Mentioned Features: {', '.join(features[:8]) if features else 'Not available'}
Total Reviews: {review_summary.get('total_reviews', 0)}
Positive Reviews: {review_summary.get('positive_count', 0)}
Negative Reviews: {review_summary.get('negative_count', 0)}

Return exactly these sections:
1) Overall Assessment
2) Strength Signals
3) Risks and Gaps
4) Recommended Actions
""".strip()

    def _build_competitor_prompt(
        self,
        product_data: Dict[str, Any],
        competitors: List[Dict[str, Any]],
        feature_gaps: List[str],
    ) -> str:
        formatted_competitors = self._format_competitors(competitors[:4])
        return f"""
Generate a strategic competitor brief.

Target Product: {product_data.get('productName', 'Unknown')}
Target Sentiment: {product_data.get('sentimentScore', 0)}/100
Target Price: ${product_data.get('price', 0)}
Target Features: {', '.join(product_data.get('features', [])[:6])}

Competitors:
{formatted_competitors}

Feature Gaps:
{', '.join(feature_gaps[:8]) if feature_gaps else 'None identified'}

Return exactly these sections:
1) Market Position
2) Competitive Advantages
3) Competitive Weaknesses
4) Strategic Moves
""".strip()

    def _generate_assistant_fallback(self, query_text: str, sentiment_score: float, features: List[str]) -> str:
        query = (query_text or "").strip().lower()
        feature_text = ", ".join(features[:5]) if features else "quality, pricing, usability"

        if any(token in query for token in ["who are you", "your name"]):
            return (
                "I'm VIBRANIUM AI Assistant. I help with sentiment, competitor positioning, "
                "feature gaps, pricing strategy, and product improvement priorities."
            )

        if any(token in query for token in ["compare", "competitor", "versus", "vs "]):
            return (
                "Focus on three dimensions: sentiment trend, feature coverage, and price-value positioning. "
                "Prioritize closing high-frequency feature gaps first, then strengthen value messaging."
            )

        if any(token in query for token in ["price", "pricing"]):
            return (
                "Keep pricing tied to clear value proof. Test one targeted offer or bundle in a segment, "
                "measure conversion lift, and scale only if retention stays stable."
            )

        return (
            f"Based on your query, current sentiment is around {sentiment_score:.1f}/100. "
            f"Prioritize high-frequency complaint fixes and align messaging to strongest features ({feature_text})."
        )

    def _format_competitors(self, competitors: List[Dict[str, Any]]) -> str:
        formatted = []
        for index, competitor in enumerate(competitors, start=1):
            formatted.append(
                f"{index}. {competitor.get('productName', 'Unknown')}: "
                f"Sentiment {competitor.get('sentimentScore', 0)}/100, "
                f"Price ${competitor.get('price', 0)}, "
                f"Features {', '.join(competitor.get('features', [])[:4])}"
            )
        return "\n".join(formatted)

    def generate_product_insights(
        self,
        product_name: str,
        sentiment_score: float,
        features: List[str],
        review_summary: Dict[str, Any],
        context_text: str = "",
    ) -> Dict[str, Any]:
        if product_name.lower() == "assistant query context":
            try:
                if self.model_loaded:
                    prompt = (
                        "Reply with one concise practical answer to this product intelligence question.\n"
                        f"Context: sentiment={sentiment_score:.1f}/100, features={', '.join(features[:6])}.\n"
                        f"Question: {context_text or 'Give improvement advice.'}"
                    )
                    assistant_text = self._call_groq(prompt, max_tokens=180)
                    generated_by = "groq"
                else:
                    assistant_text = self._generate_assistant_fallback(context_text, sentiment_score, features)
                    generated_by = "fallback"
            except Exception as error:
                logger.warning("Groq assistant generation failed, using fallback: %s", str(error))
                assistant_text = self._generate_assistant_fallback(context_text, sentiment_score, features)
                generated_by = "fallback"

            return {
                "product_name": product_name,
                "sentiment_score": sentiment_score,
                "ai_insights": assistant_text,
                "recommendation_type": self._get_recommendation_type(sentiment_score),
                "generated_by": generated_by,
            }

        try:
            if self.model_loaded:
                prompt = self._build_product_prompt(product_name, sentiment_score, features, review_summary)
                insights_text = self._call_groq(prompt, max_tokens=320)
                generated_by = "groq"
            else:
                insights_text = self._generate_structured_product_fallback(
                    product_name, sentiment_score, features, review_summary
                )
                generated_by = "fallback"
        except Exception as error:
            logger.warning("Groq product insight generation failed, using fallback: %s", str(error))
            insights_text = self._generate_structured_product_fallback(
                product_name, sentiment_score, features, review_summary
            )
            generated_by = "fallback"

        return {
            "product_name": product_name,
            "sentiment_score": sentiment_score,
            "ai_insights": insights_text,
            "recommendation_type": self._get_recommendation_type(sentiment_score),
            "generated_by": generated_by,
        }

    def generate_competitor_insights(
        self,
        product_data: Dict[str, Any],
        competitors: List[Dict[str, Any]],
        feature_gaps: List[str],
    ) -> Dict[str, Any]:
        try:
            if self.model_loaded:
                prompt = self._build_competitor_prompt(product_data, competitors, feature_gaps)
                insights_text = self._call_groq(prompt, max_tokens=320)
                generated_by = "groq"
            else:
                insights_text = self._generate_structured_competitor_fallback(
                    product_data, competitors, feature_gaps
                )
                generated_by = "fallback"
        except Exception as error:
            logger.warning("Groq competitor insight generation failed, using fallback: %s", str(error))
            insights_text = self._generate_structured_competitor_fallback(
                product_data, competitors, feature_gaps
            )
            generated_by = "fallback"

        return {
            "competitive_insights": insights_text,
            "market_position": self._assess_market_position(product_data, competitors),
            "feature_gaps": feature_gaps,
            "generated_by": generated_by,
        }

    def _get_recommendation_type(self, sentiment_score: float) -> str:
        if sentiment_score >= 75:
            return "maintain_and_amplify"
        if sentiment_score >= 60:
            return "optimize_and_improve"
        if sentiment_score >= 40:
            return "significant_improvement_needed"
        return "critical_intervention_required"

    def _assess_market_position(self, product_data: Dict[str, Any], competitors: List[Dict[str, Any]]) -> str:
        product_score = float(product_data.get("sentimentScore", 0) or 0)
        competitor_scores = [float(item.get("sentimentScore", 0) or 0) for item in competitors]

        if not competitor_scores:
            return "insufficient_data"

        avg_competitor_score = sum(competitor_scores) / len(competitor_scores)

        if product_score > avg_competitor_score + 10:
            return "market_leader"
        if product_score > avg_competitor_score:
            return "strong_position"
        if product_score > avg_competitor_score - 10:
            return "competitive"
        return "needs_improvement"
