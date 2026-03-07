import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

/**
 * Check if a user has a company profile
 */
export async function checkCompanyProfile(userId) {
  try {
    const companiesRef = collection(db, 'companies')
    const q = query(companiesRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error('Error checking company profile:', error)
    return false
  }
}

/**
 * Get user's company profile
 */
export async function getCompanyProfile(userId) {
  try {
    const companiesRef = collection(db, 'companies')
    const q = query(companiesRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
      ? null
      : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
  } catch (error) {
    console.error('Error getting company profile:', error)
    return null
  }
}

/**
 * Create/Save company information
 */
export async function saveCompanyProfile(userId, companyData) {
  try {
    const companiesRef = collection(db, 'companies')
    const q = query(companiesRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    const dataWithMeta = {
      companyName: companyData.companyName,
      gstNumber: companyData.gstNumber,
      industry: companyData.industry || '',
      website: companyData.website || '',
      country: companyData.country || '',
      state: companyData.state || '',
      city: companyData.city || '',
      userId,
      updatedAt: serverTimestamp(),
    }

    if (!querySnapshot.empty) {
      // Update existing company
      const docRef = querySnapshot.docs[0].ref
      await setDoc(docRef, dataWithMeta, { merge: true })
      return querySnapshot.docs[0].id
    } else {
      // Create new company
      const docRef = await addDoc(companiesRef, {
        ...dataWithMeta,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    }
  } catch (error) {
    console.error('Error saving company profile:', error)
    throw error
  }
}

/**
 * Add product for a company
 */
export async function addProduct(userId, companyId, productData) {
  try {
    const productsRef = collection(db, 'products')
    const docRef = await addDoc(productsRef, {
      productName: productData.productName,
      category: productData.category || '',
      description: productData.description || '',
      priceRange: productData.priceRange || '',
      primaryMarket: productData.primaryMarket || '',
      platforms: productData.platforms || [],
      userId,
      companyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
}

/**
 * Get products by companyId only (used by dashboard)
 */
export async function getProductsByCompany(companyId) {
  try {
    const productsRef = collection(db, 'products')
    const q = query(productsRef, where('companyId', '==', companyId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting products by company:', error)
    return []
  }
}


