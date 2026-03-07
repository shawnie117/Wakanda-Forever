import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { saveUserProductContext, getUserProductContext } from '../firebase/firestoreService'

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
  const { user } = useAuth()
  const [product, setProductState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...defaultProduct, ...JSON.parse(saved) }
    } catch (_) {}
    return defaultProduct
  })
  const [isLoadingFromFirestore, setIsLoadingFromFirestore] = useState(false)
  const [lastSyncedProduct, setLastSyncedProduct] = useState(null)

  // Load user's product data from Firestore when user logs in
  useEffect(() => {
    if (!user?.uid) {
      // User logged out - clear product data
      setProductState(defaultProduct)
      try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
      setLastSyncedProduct(null)
      return
    }

    // Load from Firestore
    async function loadUserProduct() {
      setIsLoadingFromFirestore(true)
      try {
        const firestoreData = await getUserProductContext(user.uid)
        
        if (firestoreData) {
          const mergedData = { ...defaultProduct, ...firestoreData }
          setProductState(mergedData)
          setLastSyncedProduct(mergedData)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData))
          } catch (_) {}
        } else {
          // No Firestore data, check localStorage
          try {
            const localData = localStorage.getItem(STORAGE_KEY)
            if (localData) {
              const parsed = JSON.parse(localData)
              setProductState({ ...defaultProduct, ...parsed })
              // Save to Firestore to sync
              await saveUserProductContext(user.uid, parsed)
              setLastSyncedProduct(parsed)
            }
          } catch (_) {}
        }
      } catch (error) {
        console.error('Error loading product from Firestore:', error)
      } finally {
        setIsLoadingFromFirestore(false)
      }
    }

    loadUserProduct()
  }, [user?.uid])

  // Auto-save to Firestore when product changes (with debouncing)
  useEffect(() => {
    if (!user?.uid || isLoadingFromFirestore) return
    
    // Don't save if product hasn't actually changed
    if (JSON.stringify(product) === JSON.stringify(lastSyncedProduct)) return

    const timeoutId = setTimeout(async () => {
      try {
        await saveUserProductContext(user.uid, product)
        setLastSyncedProduct(product)
      } catch (error) {
        console.error('Error auto-saving product to Firestore:', error)
      }
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timeoutId)
  }, [product, user?.uid, isLoadingFromFirestore, lastSyncedProduct])

  const setProduct = (updates) => {
    setProductState((prev) => {
      const next = { ...prev, ...updates }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (_) {}
      return next
    })
  }

  const clearProduct = async () => {
    setProductState(defaultProduct)
    try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
    
    // Also clear from Firestore
    if (user?.uid) {
      try {
        await saveUserProductContext(user.uid, defaultProduct)
        setLastSyncedProduct(defaultProduct)
      } catch (error) {
        console.error('Error clearing product from Firestore:', error)
      }
    }
  }

  const hasProduct = Boolean(product.productName?.trim())

  return (
    <ProductContext.Provider 
      value={{ 
        product, 
        setProduct, 
        clearProduct, 
        hasProduct,
        isLoadingFromFirestore 
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProduct must be used inside <ProductProvider>')
  return ctx
}
