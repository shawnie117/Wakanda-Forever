import { createContext, useContext, useState } from 'react'

const ProductContext = createContext(null)
const STORAGE_KEY = 'vibranium_saas_product_v2'

export const SAAS_CATEGORIES = [
  'AI Tools',
  'Analytics',
  'CRM',
  'Developer Tools',
  'Customer Support',
  'Marketing Automation',
  'Design Tools',
  'Finance / Accounting',
  'HR / Recruitment',
  'Project Management',
  'Knowledge Management',
  'Communication',
  'Security',
  'E-commerce',
  'Productivity',
]

export const CUSTOMER_SEGMENTS = ['Startup', 'SMB', 'Mid-Market', 'Enterprise']
export const BUSINESS_MODELS = ['Subscription', 'Freemium', 'Usage-based', 'One-time']
export const MARKET_REGIONS = [
  'Global', 'North America', 'Europe', 'Asia-Pacific',
  'Latin America', 'Middle East & Africa', 'India', 'South-East Asia',
]
export const USER_PERSONAS = [
  'Founder', 'Product Manager', 'Developer', 'Designer',
  'Marketer', 'Sales', 'Data Analyst', 'Customer Success',
]
export const COMPETITOR_PLATFORMS = [
  'G2', 'Capterra', 'Product Hunt', 'AppSumo',
  'Trustpilot', 'Google Play', 'App Store', 'LinkedIn',
]

export const ANALYSIS_FEATURES = [
  { key: 'competitor_features', label: 'Competitor Feature Comparison', desc: 'Compare your features against competitors' },
  { key: 'pricing_benchmark', label: 'Pricing Benchmarking', desc: 'Analyze pricing against market standards' },
  { key: 'sentiment', label: 'Customer Sentiment Analysis', desc: 'Analyze customer reviews and feedback' },
  { key: 'market_gaps', label: 'Market Gap Detection', desc: 'Identify missing features and opportunities' },
  { key: 'feature_opportunities', label: 'Feature Opportunity Insights', desc: 'Get AI recommendations for new features' },
  { key: 'positioning', label: 'Positioning Recommendations', desc: 'Strategic positioning advice' },
]

const defaultProduct = {
  // Step 1 — Product Info
  productName: '',
  websiteUrl: '',
  category: '',
  description: '',
  customerSegments: [],

  // Step 2 — Positioning
  coreProblem: '',
  keyFeatures: [],
  uvp: '',
  businessModel: '',
  pricingRange: '',

  // Step 3 — Target Market
  marketRegion: '',
  targetIndustries: [],
  companySizes: [],
  userPersonas: [],

  // Step 4 — Competitors
  competitors: [],
  competitorKeywords: [],
  alternativeCategories: [],
  competitorPlatforms: [],
  reviews: '',

  // Step 5 — Distribution
  distributionChannels: [{ platform: '', url: '' }],

  // Step 6 — Analysis Preferences
  analysisPreferences: {
    competitor_features: true,
    pricing_benchmark: true,
    sentiment: true,
    market_gaps: true,
    feature_opportunities: true,
    positioning: true,
  },
}

export function ProductProvider({ children }) {
  const [product, setProductState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...defaultProduct, ...JSON.parse(saved) }
    } catch (_) {}
    return defaultProduct
  })

  const setProduct = (updates) => {
    setProductState((prev) => {
      const next = { ...prev, ...updates }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (_) {}
      return next
    })
  }

  const clearProduct = () => {
    setProductState(defaultProduct)
    try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
  }

  const hasProduct = Boolean(product.productName?.trim())

  return (
    <ProductContext.Provider value={{ product, setProduct, clearProduct, hasProduct }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProduct must be used inside <ProductProvider>')
  return ctx
}
