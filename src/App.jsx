import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { ProductProvider } from './context/ProductContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import Footer from './components/Footer'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import Comparison from './pages/Comparison'
import Insights from './pages/Insights'
import AIAssistant from './pages/AIAssistant'
import MyAnalyses from './pages/MyAnalyses'
import ProductSetup from './pages/ProductSetup'
import MarketIntelligence from './pages/MarketIntelligence'
import ProductHealth from './pages/ProductHealth'
import CompetitorDiscovery from './pages/CompetitorDiscovery'
import SaaSProductSetup from './pages/SaaSProductSetup'
import RegionalMarketMap from './pages/RegionalMarketMap'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <LoadingScreen />

  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <div className="vibranium-bg font-sans min-h-screen text-slate-100">
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Product setup — key new route */}
                <Route path="/setup" element={<ProtectedRoute><ProductSetup /></ProtectedRoute>} />

                {/* Core AI pages */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
                <Route path="/comparison" element={<ProtectedRoute><Comparison /></ProtectedRoute>} />
                <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
                <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                <Route path="/my-analyses" element={<ProtectedRoute><MyAnalyses /></ProtectedRoute>} />

                {/* Legacy / original routes kept for backward compat */}
                <Route path="/market-intelligence" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
                <Route path="/market-intelligence/:productId" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
                <Route path="/product-health" element={<ProtectedRoute><ProductHealth /></ProtectedRoute>} />
                <Route path="/competitor-discovery" element={<ProtectedRoute><CompetitorDiscovery /></ProtectedRoute>} />
                <Route path="/saas-product-setup" element={<ProtectedRoute><SaaSProductSetup /></ProtectedRoute>} />
                <Route path="/regional-market-map" element={<ProtectedRoute><RegionalMarketMap /></ProtectedRoute>} />

                {/* Default */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AnimatePresence>
            <Footer />
          </div>
        </ProductProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
