import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import Comparison from './pages/Comparison'
import Insights from './pages/Insights'
import AIAssistant from './pages/AIAssistant'
import MyAnalyses from './pages/MyAnalyses'
import MarketRadar from './pages/MarketRadar'
import CompanySetup from './pages/CompanySetup'
import AddProduct from './pages/AddProduct'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <AuthProvider>
        <div className="font-sans min-h-screen bg-gradient-to-br from-[#020204] via-[#07010f] to-[#140024] text-slate-100">
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Company Setup Route - requires login but NOT company profile */}
              <Route
                path="/company-setup"
                element={
                  <ProtectedRoute requireProfile={false}>
                    <CompanySetup />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyze"
                element={
                  <ProtectedRoute>
                    <Analysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis/:productId"
                element={
                  <ProtectedRoute>
                    <Analysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compare"
                element={
                  <ProtectedRoute>
                    <Comparison />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <ProtectedRoute>
                    <Insights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assistant"
                element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/market-radar"
                element={
                  <ProtectedRoute>
                    <MarketRadar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-analyses"
                element={
                  <ProtectedRoute>
                    <MyAnalyses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-product"
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
