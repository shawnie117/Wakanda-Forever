import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// ========================
// SAAS PRODUCTS
// ========================

/**
 * Create a new SaaS product
 */
export async function createSaaSProduct(userId, productData) {
  try {
    const productsRef = collection(db, 'saas_products')
    const docRef = await addDoc(productsRef, {
      userId,
      productName: productData.productName,
      website: productData.website || '',
      category: productData.category || '',
      description: productData.description || '',
      targetCustomerSegment: productData.targetCustomerSegment || '',
      coreProblem: productData.coreProblem || '',
      uniqueValueProposition: productData.uniqueValueProposition || '',
      businessModel: productData.businessModel || '',
      pricingTierRange: productData.pricingTierRange || '',
      targetMarketRegion: productData.targetMarketRegion || '',
      targetIndustries: productData.targetIndustries || [],
      targetCompanySize: productData.targetCompanySize || '',
      primaryUserPersona: productData.primaryUserPersona || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating SaaS product:', error)
    throw error
  }
}

/**
 * Get all SaaS products for a user
 */
export async function getSaaSProducts(userId) {
  try {
    const productsRef = collection(db, 'saas_products')
    const q = query(productsRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting SaaS products:', error)
    return []
  }
}

/**
 * Get a single SaaS product by ID
 */
export async function getSaaSProduct(productId) {
  try {
    const docRef = doc(db, 'saas_products', productId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  } catch (error) {
    console.error('Error getting SaaS product:', error)
    return null
  }
}

/**
 * Update a SaaS product
 */
export async function updateSaaSProduct(productId, productData) {
  try {
    const docRef = doc(db, 'saas_products', productId)
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating SaaS product:', error)
    throw error
  }
}

/**
 * Delete a SaaS product
 */
export async function deleteSaaSProduct(productId) {
  try {
    await deleteDoc(doc(db, 'saas_products', productId))
  } catch (error) {
    console.error('Error deleting SaaS product:', error)
    throw error
  }
}

// ========================
// PRODUCT FEATURES
// ========================

/**
 * Save product features
 */
export async function saveProductFeatures(productId, features) {
  try {
    const featuresRef = collection(db, 'product_features')
    const q = query(featuresRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)

    const featureData = {
      productId,
      features: features || [],
      updatedAt: serverTimestamp(),
    }

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, featureData)
    } else {
      await addDoc(featuresRef, {
        ...featureData,
        createdAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error('Error saving product features:', error)
    throw error
  }
}

/**
 * Get product features
 */
export async function getProductFeatures(productId) {
  try {
    const featuresRef = collection(db, 'product_features')
    const q = query(featuresRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
      ? { features: [] }
      : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
  } catch (error) {
    console.error('Error getting product features:', error)
    return { features: [] }
  }
}

// ========================
// PRODUCT DISTRIBUTION
// ========================

/**
 * Save product distribution channels
 */
export async function saveProductDistribution(productId, platforms) {
  try {
    const distributionRef = collection(db, 'product_distribution')
    const q = query(distributionRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)

    const distributionData = {
      productId,
      platforms: platforms || [],
      updatedAt: serverTimestamp(),
    }

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, distributionData)
    } else {
      await addDoc(distributionRef, {
        ...distributionData,
        createdAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error('Error saving product distribution:', error)
    throw error
  }
}

/**
 * Get product distribution channels
 */
export async function getProductDistribution(productId) {
  try {
    const distributionRef = collection(db, 'product_distribution')
    const q = query(distributionRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
      ? { platforms: [] }
      : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
  } catch (error) {
    console.error('Error getting product distribution:', error)
    return { platforms: [] }
  }
}

// ========================
// COMPETITOR INPUTS
// ========================

/**
 * Save competitor discovery inputs
 */
export async function saveCompetitorInputs(productId, competitorData) {
  try {
    const competitorsRef = collection(db, 'competitor_inputs')
    const q = query(competitorsRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)

    const inputData = {
      productId,
      knownCompetitors: competitorData.knownCompetitors || [],
      competitorSearchKeywords: competitorData.competitorSearchKeywords || [],
      alternativeCategories: competitorData.alternativeCategories || [],
      searchPlatforms: competitorData.searchPlatforms || [],
      updatedAt: serverTimestamp(),
    }

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, inputData)
    } else {
      await addDoc(competitorsRef, {
        ...inputData,
        createdAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error('Error saving competitor inputs:', error)
    throw error
  }
}

/**
 * Get competitor inputs
 */
export async function getCompetitorInputs(productId) {
  try {
    const competitorsRef = collection(db, 'competitor_inputs')
    const q = query(competitorsRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
      ? {
          knownCompetitors: [],
          competitorSearchKeywords: [],
          alternativeCategories: [],
          searchPlatforms: [],
        }
      : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
  } catch (error) {
    console.error('Error getting competitor inputs:', error)
    return {
      knownCompetitors: [],
      competitorSearchKeywords: [],
      alternativeCategories: [],
      searchPlatforms: [],
    }
  }
}

// ========================
// ANALYSIS PREFERENCES
// ========================

/**
 * Save analysis preferences
 */
export async function saveAnalysisPreferences(productId, preferences) {
  try {
    const preferencesRef = collection(db, 'analysis_preferences')
    const q = query(preferencesRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)

    const prefData = {
      productId,
      compareFeatures: preferences.compareFeatures ?? true,
      pricingBenchmark: preferences.pricingBenchmark ?? true,
      sentimentAnalysis: preferences.sentimentAnalysis ?? true,
      marketGapDetection: preferences.marketGapDetection ?? true,
      featureOpportunityInsights: preferences.featureOpportunityInsights ?? true,
      positioningRecommendations: preferences.positioningRecommendations ?? true,
      outputTypes: preferences.outputTypes || [],
      updatedAt: serverTimestamp(),
    }

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, prefData)
    } else {
      await addDoc(preferencesRef, {
        ...prefData,
        createdAt: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error('Error saving analysis preferences:', error)
    throw error
  }
}

/**
 * Get analysis preferences
 */
export async function getAnalysisPreferences(productId) {
  try {
    const preferencesRef = collection(db, 'analysis_preferences')
    const q = query(preferencesRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
      ? {
          compareFeatures: true,
          pricingBenchmark: true,
          sentimentAnalysis: true,
          marketGapDetection: true,
          featureOpportunityInsights: true,
          positioningRecommendations: true,
          outputTypes: [],
        }
      : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
  } catch (error) {
    console.error('Error getting analysis preferences:', error)
    return {
      compareFeatures: true,
      pricingBenchmark: true,
      sentimentAnalysis: true,
      marketGapDetection: true,
      featureOpportunityInsights: true,
      positioningRecommendations: true,
      outputTypes: [],
    }
  }
}

// ========================
// AI ANALYSIS RESULTS
// ========================

/**
 * Save AI analysis results
 */
export async function saveAnalysisResults(productId, analysisData) {
  try {
    const analysisRef = collection(db, 'analysis_results')
    const docRef = await addDoc(analysisRef, {
      productId,
      ...analysisData,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving analysis results:', error)
    throw error
  }
}

/**
 * Get latest analysis results for a product
 */
export async function getLatestAnalysis(productId) {
  try {
    const analysisRef = collection(db, 'analysis_results')
    const q = query(analysisRef, where('productId', '==', productId))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) return null
    
    // Sort by createdAt and get the most recent
    const analyses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    
    analyses.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0
      const bTime = b.createdAt?.toMillis() || 0
      return bTime - aTime
    })
    
    return analyses[0]
  } catch (error) {
    console.error('Error getting latest analysis:', error)
    return null
  }
}

// ========================
// USER DATA & SESSIONS
// ========================

/**
 * Save user's current product context (for persistence across sessions)
 */
export async function saveUserProductContext(userId, productData) {
  try {
    const userContextRef = doc(db, 'user_contexts', userId)
    await setDoc(
      userContextRef,
      {
        productData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error saving user product context:', error)
    throw error
  }
}

/**
 * Get user's product context
 */
export async function getUserProductContext(userId) {
  try {
    const userContextRef = doc(db, 'user_contexts', userId)
    const docSnap = await getDoc(userContextRef)
    
    if (docSnap.exists()) {
      return docSnap.data().productData || null
    }
    return null
  } catch (error) {
    console.error('Error getting user product context:', error)
    return null
  }
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(userId, preferences) {
  try {
    const userPrefsRef = doc(db, 'user_preferences', userId)
    await setDoc(
      userPrefsRef,
      {
        ...preferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error saving user preferences:', error)
    throw error
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId) {
  try {
    const userPrefsRef = doc(db, 'user_preferences', userId)
    const docSnap = await getDoc(userPrefsRef)
    
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  } catch (error) {
    console.error('Error getting user preferences:', error)
    return null
  }
}

/**
 * Save analysis to user's history
 */
export async function saveAnalysisToHistory(userId, analysisData) {
  try {
    const analysesRef = collection(db, 'analyses')
    const docRef = await addDoc(analysesRef, {
      userId,
      productName: analysisData.productName || '',
      sentimentScore: analysisData.sentimentScore || 0,
      competitorScore: analysisData.competitorScore || 0,
      insights: analysisData.insights || [],
      features: analysisData.features || [],
      metadata: analysisData.metadata || {},
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving analysis to history:', error)
    throw error
  }
}



