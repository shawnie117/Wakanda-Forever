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

const defaultProductState = {
  activeId: 'default',
  products: [{ id: 'default', ...defaultProduct }],
}

export function ProductProvider({ children }) {
  const { user } = useAuth()
  const [store, setStore] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Migration from old single-product structure
        if (!parsed.products) {
          return { activeId: 'default', products: [{ id: 'default', ...defaultProduct, ...parsed }] }
        }
        return parsed
      }
    } catch (_) {}
    return defaultProductState
  })
  
  const [isLoadingFromFirestore, setIsLoadingFromFirestore] = useState(false)
  const [lastSyncedStore, setLastSyncedStore] = useState(null)

  // Computed active product
  const product = store.products.find(p => p.id === store.activeId) || defaultProduct

  // Load user's product data from Firestore when user logs in
  useEffect(() => {
    if (!user?.uid) {
      setStore(defaultProductState)
      try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
      setLastSyncedStore(null)
      return
    }

    async function loadUserProduct() {
      setIsLoadingFromFirestore(true)
      try {
        const firestoreData = await getUserProductContext(user.uid)
        
        if (firestoreData) {
          let mergedStore = firestoreData
          // Migration from old single-product structure
          if (!firestoreData.products) {
            mergedStore = { activeId: 'default', products: [{ id: 'default', ...defaultProduct, ...firestoreData }] }
          }
          setStore(mergedStore)
          setLastSyncedStore(mergedStore)
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedStore)) } catch (_) {}
        } else {
          // No Firestore data, check localStorage
          try {
            const localData = localStorage.getItem(STORAGE_KEY)
            if (localData) {
              const parsed = JSON.parse(localData)
              let mergedStore = parsed
              if (!parsed.products) {
                mergedStore = { activeId: 'default', products: [{ id: 'default', ...defaultProduct, ...parsed }] }
              }
              setStore(mergedStore)
              await saveUserProductContext(user.uid, mergedStore)
              setLastSyncedStore(mergedStore)
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

  // Auto-save to Firestore when store changes (with debouncing)
  useEffect(() => {
    if (!user?.uid || isLoadingFromFirestore) return
    
    if (JSON.stringify(store) === JSON.stringify(lastSyncedStore)) return

    const timeoutId = setTimeout(async () => {
      try {
        await saveUserProductContext(user.uid, store)
        setLastSyncedStore(store)
      } catch (error) {
        console.error('Error auto-saving store to Firestore:', error)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [store, user?.uid, isLoadingFromFirestore, lastSyncedStore])

  const setProduct = (updates) => {
    setStore((prev) => {
      const updatedProducts = prev.products.map(p => 
        p.id === prev.activeId ? { ...p, ...updates } : p
      )
      const next = { ...prev, products: updatedProducts }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (_) {}
      return next
    })
  }

  const switchProduct = (id) => {
    setStore(prev => {
      const next = { ...prev, activeId: id }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (_) {}
      return next
    })
  }

  const addNewProduct = () => {
    const newId = `prod_${Date.now()}`
    setStore(prev => {
      const previousActiveId = prev.activeId
      const next = { 
        activeId: newId, 
        products: [
          ...prev.products,
          { id: newId, ...defaultProduct, _isDraft: true, _previousActiveId: previousActiveId },
        ],
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (_) {}
      return next
    })
  }

  const discardActiveDraftIfEmpty = () => {
    setStore((prev) => {
      const active = prev.products.find((p) => p.id === prev.activeId)
      if (!active?._isDraft) return prev

      // Only auto-discard untouched drafts. If name exists, user started entering real data.
      if (active.productName?.trim()) return prev

      const remainingProducts = prev.products.filter((p) => p.id !== active.id)
      const fallbackByPrevious = remainingProducts.find((p) => p.id === active._previousActiveId)
      const fallbackByName = remainingProducts.find((p) => p.productName?.trim())
      const fallback = fallbackByPrevious || fallbackByName || remainingProducts[0]

      const next = {
        activeId: fallback?.id || 'default',
        products: remainingProducts.length ? remainingProducts : [{ id: 'default', ...defaultProduct }],
      }

      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (_) {}
      return next
    })
  }

  const clearProduct = async () => {
    setStore(defaultProductState)
    try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
    
    if (user?.uid) {
      try {
        await saveUserProductContext(user.uid, defaultProductState)
        setLastSyncedStore(defaultProductState)
      } catch (error) {
        console.error('Error clearing store from Firestore:', error)
      }
    }
  }

  const hasProduct = Boolean(product.productName?.trim())

  return (
    <ProductContext.Provider 
      value={{ 
        store,
        product, 
        setProduct, 
        clearProduct, 
        switchProduct,
        addNewProduct,
        discardActiveDraftIfEmpty,
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
