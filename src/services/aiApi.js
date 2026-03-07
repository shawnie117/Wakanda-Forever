const API_BASE_URL = import.meta.env.VITE_AI_API_URL || '/api/v1'

const trimSlash = (value) => String(value || '').replace(/\/+$/, '')
const normalizePath = (path) => (path.startsWith('/') ? path : `/${path}`)
const buildUrl = (base, path) => `${trimSlash(base)}${normalizePath(path)}`

const legacyBase = (() => {
  const base = trimSlash(API_BASE_URL)
  return base.endsWith('/api/v1') ? base.slice(0, -'/api/v1'.length) || '' : base
})()

let detectedApiModePromise = null

async function detectApiMode() {
  if (!detectedApiModePromise) {
    detectedApiModePromise = (async () => {
      try {
        const probeBase = legacyBase || trimSlash(API_BASE_URL)
        const result = await doFetch(probeBase, '/openapi.json', { method: 'GET' })
        const paths = result?.data?.paths ? Object.keys(result.data.paths) : []

        const hasPrefixed = paths.some((path) => path.startsWith('/api/v1/'))
        const hasLegacy = paths.includes('/analyze') || paths.includes('/market-analysis')

        if (hasLegacy && !hasPrefixed) return 'legacy'
        if (hasPrefixed) return 'prefixed'
        return 'unknown'
      } catch {
        return 'unknown'
      } 
    })()
  }

  return detectedApiModePromise
}

async function doFetch(base, path, options = {}) {
  const response = await fetch(buildUrl(base, path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => null)
  return { ok: response.ok, status: response.status, data }
}

async function requestWithFallback(primaryPath, options = {}, config = {}) {
  const { legacyPath, allowNotFound = false, fallbackStatuses = [404] } = config
  const mode = await detectApiMode()
  const attempts = []

  if (mode === 'legacy') {
    const base = legacyBase || trimSlash(API_BASE_URL)
    attempts.push({ base, path: legacyPath || primaryPath })
    if (legacyPath && legacyPath !== primaryPath) {
      attempts.push({ base, path: primaryPath })
    }
  } else {
    attempts.push({ base: API_BASE_URL, path: primaryPath })

    if (legacyPath && legacyPath !== primaryPath) {
      attempts.push({ base: API_BASE_URL, path: legacyPath })
    }

    if (legacyBase !== trimSlash(API_BASE_URL)) {
      attempts.push({ base: legacyBase, path: legacyPath || primaryPath })
    }
  }

  let lastError = null

  for (const attempt of attempts) {
    const result = await doFetch(attempt.base, attempt.path, options)

    if (result.ok) return result.data

    if (fallbackStatuses.includes(result.status)) {
      lastError = new Error(`Not found: ${attempt.path}`)
      continue
    }

    const message =
      result.data?.detail || result.data?.error || `Request failed with status ${result.status}`
    throw new Error(message)
  }

  if (allowNotFound) return null
  throw lastError || new Error('Request failed')
}

const toPct = (value) => Math.round(Number(value || 0) * 100)

function normalizeLegacyAnalyze(productName, legacy) {
  const segments = Array.isArray(legacy?.analysis) ? legacy.analysis : []
  const positive = segments.filter((item) => String(item.sentiment).toUpperCase() === 'POSITIVE').length
  const negative = segments.filter((item) => String(item.sentiment).toUpperCase() === 'NEGATIVE').length
  const total = segments.length || 1
  const neutral = Math.max(0, total - positive - negative)

  const avgPositive = segments.length
    ? segments.reduce((sum, item) => sum + Number(item.positive_score || 0), 0) / segments.length
    : 0

  return {
    product_name: productName,
    metadata: {},
    sentiment_analysis: {
      overall_score: Math.round(avgPositive * 100),
      sentiment_summary: `${positive}/${segments.length} positive segments`,
      total_reviews: segments.length,
      distribution: {
        positive: Math.round((positive / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        negative: Math.round((negative / total) * 100),
      },
      counts: { positive, neutral, negative },
    },
    feature_analysis: {
      extracted_features: segments.map((item) => item.segment).filter(Boolean).slice(0, 8),
      feature_summary: {},
      top_categories: [],
      total_mentions: segments.length,
    },
    ai_insights: {
      insights_text: segments
        .map((item) => `${item.segment} → ${String(item.sentiment).toLowerCase()} (${Math.round(Number(item.confidence || 0) * 100)}%)`)
        .join('\n'),
      recommendation_type: 'legacy_hf',
      generated_by: 'legacy_hf',
    },
    analysis_metadata: {
      total_reviews_analyzed: segments.length,
      pipeline_version: 'legacy_hf_compat',
    },
  }
}

async function analyzeLegacyText(text) {
  return requestWithFallback('/analyze', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }, { legacyPath: '/analyze' })
}

export async function analyzeProduct({ productName, category, reviews }) {
  const mappedReviews = (reviews || []).map((r, index) => ({
    reviewId: r.reviewId || `review_${index + 1}`,
    text: r.text,
    rating: r.rating,
    verified: r.verified ?? false,
    date: r.date,
  }))

  if (mappedReviews.length === 0) {
    throw new Error('No live reviews available for analysis.')
  }

  const response = await requestWithFallback('/analyze-product', {
    method: 'POST',
    body: JSON.stringify({
      product_name: productName,
      reviews: mappedReviews,
      metadata: { category, brand: productName?.split(' ')[0] },
    }),
  }, {
    legacyPath: '/analyze',
    fallbackStatuses: [404, 405, 422],
  })

  if (response?.sentiment_analysis) return response
  if (response?.analysis) return normalizeLegacyAnalyze(productName, response)
  return normalizeLegacyAnalyze(productName, { analysis: [] })
}

export async function compareProducts({ yourProduct, competitorNames }) {
  const response = await requestWithFallback('/compare-products', {
    method: 'POST',
    body: JSON.stringify({
      target_product: { productName: yourProduct, features: [] },
      competitors: (competitorNames || []).map((name) => ({ productName: name, features: [] })),
    }),
  }, { allowNotFound: true })

  if (response) return response

  const names = [yourProduct, ...(competitorNames || [])]
  const sentiment = await Promise.all(
    names.map(async (name) => {
      try {
        const result = await analyzeLegacyText(name)
        const segments = Array.isArray(result?.analysis) ? result.analysis : []
        const score = segments.length
          ? Math.round(
              (segments.reduce((sum, item) => sum + Number(item.positive_score || 0), 0) /
                segments.length) *
                100,
            )
          : 50
        return { name, score }
      } catch {
        return { name, score: 50 }
      }
    }),
  )

  const target = sentiment[0] || { name: yourProduct, score: 50 }
  const competitors = sentiment.slice(1)
  const avg = competitors.length
    ? competitors.reduce((sum, item) => sum + item.score, 0) / competitors.length
    : 50
  const rank = 1 + competitors.filter((item) => item.score > target.score).length

  return {
    target_product: {
      productName: yourProduct,
      sentiment_score: target.score,
      price: 0,
      feature_count: 0,
    },
    competitors_analyzed: competitors.length,
    feature_gaps: {
      gaps_identified: competitors.slice(0, 3).map((item) => `Differentiate against ${item.name}`),
      total_gaps: Math.min(3, competitors.length),
      priority: competitors.slice(0, 3).map((item, index) => ({
        feature: `Positioning vs ${item.name}`,
        score: Number(((index + 1) / 10).toFixed(2)),
      })),
    },
    price_comparison: {
      target_price: 0,
      position: 'unknown',
      price_range: { min: 0, max: 0, avg: 0 },
      price_difference_from_avg: 0,
      price_percentile: 50,
    },
    sentiment_comparison: {
      target_sentiment: target.score,
      rank,
      total_products: competitors.length + 1,
      competitors: competitors.map((item) => ({ productName: item.name, score: item.score })),
      average_competitor_sentiment: Number(avg.toFixed(2)),
      difference_from_average: Number((target.score - avg).toFixed(2)),
      position: target.score >= avg ? 'above_average' : 'below_average',
    },
    feature_comparison: {
      target_feature_count: 0,
      average_competitor_count: 0,
      competitor_counts: competitors.map((item) => ({ productName: item.name, feature_count: 0 })),
      common_features: [],
      common_feature_count: 0,
      position: 'neutral',
    },
    competitive_insights: {
      competitive_insights: `Comparison generated in compatibility mode for ${competitors.length} competitors.`,
      market_position: rank === 1 ? 'leader' : 'challenger',
      feature_gaps: competitors.slice(0, 2).map((item) => item.name),
      generated_by: 'legacy_hf_compat',
    },
    overall_position: {
      overall_score: target.score,
      tier: rank === 1 ? 'top_tier' : 'mid_tier',
      rank,
      total_products: competitors.length + 1,
      strengths: target.score >= avg ? ['Sentiment benchmark above peers'] : ['Stable sentiment baseline'],
      weaknesses: target.score < avg ? ['Sentiment benchmark below peers'] : ['Limited competitor coverage'],
    },
  }
}

export async function getAiHealth() {
  const health = await requestWithFallback('/health', {}, { allowNotFound: true })
  if (health) return health

  const openapi = await requestWithFallback('/openapi.json', {}, { legacyPath: '/openapi.json', allowNotFound: true })
  return {
    status: openapi ? 'healthy' : 'degraded',
    version: 'legacy_hf_compat',
    models_loaded: {},
  }
}

export async function collectData({ productName, region = 'Global', maxItemsPerSource = 10, competitors = [] }) {
  const response = await requestWithFallback('/collect-data', {
    method: 'POST',
    body: JSON.stringify({
      product_name: productName,
      region,
      max_items_per_source: maxItemsPerSource,
      competitors,
    }),
  }, { allowNotFound: true, fallbackStatuses: [404, 405, 422] })

  if (response) return response

  return {
    product: productName,
    region,
    collected: 0,
    stored: 0,
    storage: 'legacy_hf_no_collector',
    records: [],
  }
}

const normalizeLegacyMarket = (productName, payload) => {
  const regions = Object.entries(payload?.market_analysis || {}).map(([region, data]) => {
    const adoption = Math.round(Number(data?.adoption_index || 0))
    return {
      region,
      review_volume: 0,
      sentiment_score: Number(data?.sentiment_score || 0),
      adoption_score: adoption,
      popularity_score: adoption,
      competitor_density: Number(data?.competitor_density || 0),
      growth_indicator: 0,
      opportunity: adoption >= 75 ? 'High' : adoption >= 50 ? 'Medium' : 'Low',
    }
  })

  const overall = regions.length
    ? {
        adoption_score: Number((regions.reduce((sum, item) => sum + item.adoption_score, 0) / regions.length).toFixed(2)),
        popularity_score: Number((regions.reduce((sum, item) => sum + item.popularity_score, 0) / regions.length).toFixed(2)),
        competitor_density: Number((regions.reduce((sum, item) => sum + item.competitor_density, 0) / regions.length).toFixed(2)),
        growth_indicator: 0,
        sentiment_score: Number((regions.reduce((sum, item) => sum + item.sentiment_score, 0) / regions.length).toFixed(4)),
      }
    : { adoption_score: 0, popularity_score: 0, competitor_density: 0, growth_indicator: 0, sentiment_score: 0 }

  return {
    product_filter: productName || null,
    data_source: 'legacy_hf_compat',
    record_count: regions.length,
    market_intelligence: { overall, regions },
  }
}

export async function getMarketAnalysis(productName) {
  const query = productName ? `?product=${encodeURIComponent(productName)}` : ''
  const response = await requestWithFallback(`/market-analysis${query}`, {}, {
    allowNotFound: true,
    fallbackStatuses: [404, 405, 422],
  })

  if (response?.market_intelligence) return response
  if (response?.market_analysis) return normalizeLegacyMarket(productName, response)

  const legacy = await requestWithFallback('/market-analysis', {
    method: 'POST',
    body: JSON.stringify({}),
  }, {
    legacyPath: '/market-analysis',
    allowNotFound: true,
    fallbackStatuses: [404, 405, 422],
  })

  if (legacy?.market_analysis) return normalizeLegacyMarket(productName, legacy)

  return {
    product_filter: productName || null,
    data_source: 'unavailable',
    record_count: 0,
    market_intelligence: {
      overall: { adoption_score: 0, popularity_score: 0, competitor_density: 0, growth_indicator: 0, sentiment_score: 0 },
      regions: [],
    },
  }
}

export async function analyzeTexts({ productName, reviews = [], region = 'Global', competitors = [] }) {
  const response = await requestWithFallback('/analyze', {
    method: 'POST',
    body: JSON.stringify({ product_name: productName, reviews, region, competitors }),
  }, {
    allowNotFound: true,
    fallbackStatuses: [404, 405, 422],
  })

  if (response?.records) return response

  const text = (reviews || []).join(' ').trim() || productName || 'analysis'
  const legacy = await analyzeLegacyText(text)
  const records = (legacy?.analysis || []).map((item, index) => ({
    id: `legacy_${index + 1}`,
    product: productName,
    source: 'legacy_hf',
    review: item.segment,
    sentiment: String(item.sentiment || 'neutral').toLowerCase(),
    positive_score: Number(item.positive_score || 0),
    negative_score: Number(item.negative_score || 0),
    keywords: item.segment,
    date: new Date().toISOString(),
    region,
  }))

  return {
    product: productName,
    analyzed: records.length,
    records,
  }
}

export async function extractKeywords({ text, topK = 8 }) {
  const response = await requestWithFallback('/extract-keywords', {
    method: 'POST',
    body: JSON.stringify({ text, top_k: topK }),
  }, { legacyPath: '/extract-keywords' })

  if (Array.isArray(response?.keywords) && Array.isArray(response.keywords[0])) {
    const keywords = response.keywords.slice(0, topK).map((item) => item[0]).filter(Boolean)
    return { keywords, count: keywords.length }
  }

  return response
}

const tokenize = (value) => String(value || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
const overlap = (a, b) => {
  const left = new Set(tokenize(a))
  const right = new Set(tokenize(b))
  if (left.size === 0 || right.size === 0) return 0
  const intersection = [...left].filter((token) => right.has(token)).length
  const union = new Set([...left, ...right]).size
  return union ? intersection / union : 0
}

export async function discoverCompetitors({ text, candidates = [] }) {
  const response = await requestWithFallback('/competitor-discovery', {
    method: 'POST',
    body: JSON.stringify({ text, candidates }),
  }, {
    allowNotFound: true,
    fallbackStatuses: [404, 405, 422],
  })

  if (response) return response

  const allScores = {}
  candidates.forEach((candidate) => {
    allScores[candidate] = Number(overlap(text, candidate).toFixed(4))
  })

  const top_matches = Object.entries(allScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, score]) => ({ name, score }))

  return { top_matches, all_scores: allScores }
}

export async function getSheetData({ productName, limit } = {}) {
  const params = new URLSearchParams()
  if (productName) params.append('product', productName)
  if (typeof limit === 'number') params.append('limit', String(limit))
  const query = params.toString()

  const response = await requestWithFallback(`/sheet-data${query ? `?${query}` : ''}`, {}, {
    allowNotFound: true,
    fallbackStatuses: [404, 405, 422],
  })
  if (response) return response

  return { source: 'legacy_hf_no_sheet', count: 0, rows: [] }
}

export function getProductProfile(productName) {
  return { productName, features: [] }
}
