import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { checkCompanyProfile } from '../firebase/firestoreService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(false)

  const refreshCompanyProfileStatus = async (userIdOverride) => {
    const activeUserId = userIdOverride || user?.uid
    if (!activeUserId) {
      setHasCompanyProfile(false)
      return false
    }

    setCheckingProfile(true)
    try {
      const hasProfile = await checkCompanyProfile(activeUserId)
      setHasCompanyProfile(hasProfile)
      return hasProfile
    } catch (error) {
      console.error('Error checking company profile:', error)
      setHasCompanyProfile(false)
      return false
    } finally {
      setCheckingProfile(false)
    }
  }

  const markCompanyProfileComplete = () => {
    setHasCompanyProfile(true)
    setCheckingProfile(false)
  }

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        // Check if user has company profile
        await refreshCompanyProfileStatus(currentUser.uid)
      } else {
        setHasCompanyProfile(false)
        setCheckingProfile(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasCompanyProfile,
        checkingProfile,
        refreshCompanyProfileStatus,
        markCompanyProfileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
