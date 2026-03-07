import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/GlassCard'
import LoadingOverlay from '../components/LoadingOverlay'
import PrimaryButton from '../components/PrimaryButton'
import {
  getSaaSProduct,
  getSaaSProducts,
  getProductFeatures,
  getCompetitorInputs,
  getAnalysisPreferences,
  getLatestAnalysis,
  saveAnalysisResults,
} from '../firebase/firestoreService'
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Target,
  Users,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Brain,
  DollarSign,
} from 'lucide-react'

export default function MarketIntelligence() {
  const { productId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [product, setProduct] = useState(null)
  const [features, setFeatures] = useState([])
  const [competitorInputs, setCompetitorInputs] = useState(null)
  const [analysisPrefs, setAnalysisPrefs] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)

  useEffect(() => {
    if (!user) return

    if (!productId) {
      const resolveDefaultProduct = async () => {
        try {
          const products = await getSaaSProducts(user.uid)
          if (products.length > 0) {
            navigate(`/market-intelligence/${products[0].id}`, { replace: true })
            return
          }
        } catch (error) {
          console.error('Error resolving default product for market intelligence:', error)
        } finally {
          setLoading(false)
        }
      }

      resolveDefaultProduct()
      return
    }

    const loadProductData = async () => {
      try {
        const [productData, featuresData, competitorData, prefsData, latestAnalysis] =
          await Promise.all([
            getSaaSProduct(productId),
            getProductFeatures(productId),
            getCompetitorInputs(productId),
            getAnalysisPreferences(productId),
            getLatestAnalysis(productId),
          ])

        setProduct(productData)
        setFeatures(featuresData.features || [])
        setCompetitorInputs(competitorData)
        setAnalysisPrefs(prefsData)
        setAnalysisResults(latestAnalysis)
      } catch (error) {
        console.error('Error loading product data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProductData()
  }, [productId, user, navigate])

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      // TODO: Call FastAPI backend for AI analysis
      // For now, generate mock data
      const mockResults = {
        competitorFeatureMatrix: [
          {
            feature: 'Analytics Dashboard',
            yourProduct: 85,
            competitor1: 90,
            competitor2: 75,
            marketAvg: 83,
          },
          { feature: 'API Integration', yourProduct: 90, competitor1: 85, competitor2: 95, marketAvg: 90 },
          { feature: 'Team Collaboration', yourProduct: 75, competitor1: 80, competitor2: 85, marketAvg: 80 },
          { feature: 'Automation', yourProduct: 80, competitor1: 90, competitor2: 70, marketAvg: 80 },
          { feature: 'Mobile App', yourProduct: 65, competitor1: 75, competitor2: 80, marketAvg: 73 },
        ],
        pricingComparison: [
          { tier: 'Starter', yourPrice: 49, avgMarket: 39, suggested: 44 },
          { tier: 'Professional', yourPrice: 99, avgMarket: 89, suggested: 94 },
          { tier: 'Enterprise', yourPrice: 299, avgMarket: 349, suggested: 324 },
        ],
        marketGaps: [
          {
            title: 'Mobile App Enhancement',
            description: 'Competitors score 15% higher on mobile capabilities',
            priority: 'High',
            impact: 'Could increase market share by 12%',
          },
          {
            title: 'Advanced Automation',
            description: 'Market leaders offer 10+ automation templates',
            priority: 'Medium',
            impact: 'Feature requested by 45% of target segment',
          },
          {
            title: 'White-label Options',
            description: 'Enterprise segment expects customization',
            priority: 'Medium',
            impact: 'Unlock 25% larger deal sizes',
          },
        ],
        swotAnalysis: {
          strengths: [
            'Strong API integration capabilities',
            'Competitive pricing in professional tier',
            'High marks for analytics features',
          ],
          weaknesses: [
            'Mobile experience lags competitors',
            'Limited automation templates',
            'Fewer team collaboration features',
          ],
          opportunities: [
            'Expand into enterprise white-label market',
            'Develop mobile-first features',
            'Partner with workflow automation platforms',
          ],
          threats: [
            'Competitors rapidly improving mobile apps',
            'Market consolidation reducing pricing power',
            'New entrants with AI-native features',
          ],
        },
        positioningRecommendations: [
          {
            title: 'Position as API-First Solution',
            description:
              'Leverage your strong API capabilities to target developer-focused teams',
            actionItems: [
              'Create developer documentation hub',
              'Launch API showcase examples',
              'Partner with dev tool marketplaces',
            ],
          },
          {
            title: 'Optimize Professional Tier Positioning',
            description:
              'Your sweet spot is professional tier - emphasize value vs enterprise solutions',
            actionItems: [
              'Highlight ROI vs enterprise alternatives',
              'Create mid-market case studies',
              'Offer team migration assistance',
            ],
          },
        ],
        sentimentScore: 78,
        marketPositionScore: 72,
        competitiveAdvantageScore: 68,
      }

      await saveAnalysisResults(productId, {
        ...mockResults,
        userId: user.uid,
        productName: product.productName,
      })

      setAnalysisResults(mockResults)
    } catch (error) {
      console.error('Error running analysis:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <LoadingOverlay subtitle="LOADING PRODUCT DATA" />
      </div>
    )
  }

  if (!productId && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-8">
        <GlassCard className="p-8 text-center max-w-lg">
          <Target className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No SaaS Product Found Yet</h2>
          <p className="text-gray-400 mb-6">
            Create your first SaaS product profile to unlock Market Intelligence analysis.
          </p>
          <PrimaryButton
            onClick={() => navigate('/saas-product-setup')}
          >
            Create SaaS Product
          </PrimaryButton>
        </GlassCard>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-8">
        <GlassCard className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6">This product doesn't exist or you don't have access to it.</p>
          <PrimaryButton
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </PrimaryButton>
        </GlassCard>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                {product.productName}
              </h1>
              <p className="text-gray-400">AI-Powered SaaS Market Intelligence</p>
              {product.website && (
                <a
                  href={product.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-2 mt-2"
                >
                  {product.website} <ArrowRight size={14} />
                </a>
              )}
            </div>
            <PrimaryButton
              onClick={runAnalysis}
              disabled={analyzing}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain size={20} />
              {analyzing ? 'Analyzing...' : analysisResults ? 'Re-Run Analysis' : 'Run AI Analysis'}
            </PrimaryButton>
          </div>
        </motion.div>

        {/* Product Context */}
        <motion.div variants={itemVariants} className="mb-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target size={24} className="text-purple-400" />
              Product Context
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Category</p>
                <p className="text-white font-semibold">{product.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Business Model</p>
                <p className="text-white font-semibold">{product.businessModel || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Customer Segment</p>
                <p className="text-white font-semibold">{product.targetCustomerSegment || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pricing Range</p>
                <p className="text-white font-semibold">{product.pricingTierRange || 'Not set'}</p>
              </div>
            </div>

            {features.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Key Features ({features.length})</p>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {competitorInputs && competitorInputs.knownCompetitors && competitorInputs.knownCompetitors.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">
                  Known Competitors ({competitorInputs.knownCompetitors.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {competitorInputs.knownCompetitors.map((competitor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
                    >
                      {competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Analysis Results */}
        {analyzing && (
          <motion.div variants={itemVariants}>
            <LoadingOverlay subtitle="RUNNING AI ANALYSIS..." />
          </motion.div>
        )}

        {!analyzing && analysisResults && (
          <>
            {/* Key Metrics */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mb-8">
              <GlassCard className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-400" size={32} />
                </div>
                <p className="text-gray-400 text-sm mb-2">Market Sentiment</p>
                <p className="text-4xl font-bold text-white">{analysisResults.sentimentScore}%</p>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="text-purple-400" size={32} />
                </div>
                <p className="text-gray-400 text-sm mb-2">Market Position</p>
                <p className="text-4xl font-bold text-white">
                  {analysisResults.marketPositionScore}%
                </p>
              </GlassCard>
              <GlassCard className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-pink-400" size={32} />
                </div>
                <p className="text-gray-400 text-sm mb-2">Competitive Advantage</p>
                <p className="text-4xl font-bold text-white">
                  {analysisResults.competitiveAdvantageScore}%
                </p>
              </GlassCard>
            </motion.div>

            {/* Feature Comparison */}
            {analysisResults.competitorFeatureMatrix && (
              <motion.div variants={itemVariants} className="mb-8">
                <GlassCard className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Competitor Feature Comparison
                  </h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analysisResults.competitorFeatureMatrix}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="feature" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e1b4b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="yourProduct" fill="#a855f7" name="Your Product" />
                      <Bar dataKey="marketAvg" fill="#c084fc" name="Market Average" />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>
              </motion.div>
            )}

            {/* Pricing Comparison */}
            {analysisResults.pricingComparison && (
              <motion.div variants={itemVariants} className="mb-8">
                <GlassCard className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign size={24} className="text-green-400" />
                    Pricing Strategy Analysis
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analysisResults.pricingComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="tier" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e1b4b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="yourPrice"
                        stroke="#a855f7"
                        strokeWidth={2}
                        name="Your Pricing"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgMarket"
                        stroke="#c084fc"
                        strokeWidth={2}
                        name="Market Average"
                      />
                      <Line
                        type="monotone"
                        dataKey="suggested"
                        stroke="#c084fc"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="AI Suggested"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>
              </motion.div>
            )}

            {/* Market Gaps */}
            {analysisResults.marketGaps && analysisResults.marketGaps.length > 0 && (
              <motion.div variants={itemVariants} className="mb-8">
                <GlassCard className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={24} className="text-yellow-400" />
                    Market Gap Opportunities
                  </h2>
                  <div className="space-y-4">
                    {analysisResults.marketGaps.map((gap, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold">{gap.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              gap.priority === 'High'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {gap.priority} Priority
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{gap.description}</p>
                        <p className="text-purple-300 text-sm font-medium">{gap.impact}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* SWOT Analysis */}
            {analysisResults.swotAnalysis && (
              <motion.div variants={itemVariants} className="mb-8">
                <GlassCard className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">SWOT Analysis</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle size={20} />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysisResults.swotAnalysis.strengths.map((item, index) => (
                          <li key={index} className="text-gray-300 text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle size={20} />
                        Weaknesses
                      </h3>
                      <ul className="space-y-2">
                        {analysisResults.swotAnalysis.weaknesses.map((item, index) => (
                          <li key={index} className="text-gray-300 text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp size={20} />
                        Opportunities
                      </h3>
                      <ul className="space-y-2">
                        {analysisResults.swotAnalysis.opportunities.map((item, index) => (
                          <li key={index} className="text-gray-300 text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle size={20} />
                        Threats
                      </h3>
                      <ul className="space-y-2">
                        {analysisResults.swotAnalysis.threats.map((item, index) => (
                          <li key={index} className="text-gray-300 text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Positioning Recommendations */}
            {analysisResults.positioningRecommendations &&
              analysisResults.positioningRecommendations.length > 0 && (
                <motion.div variants={itemVariants} className="mb-8">
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Brain size={24} className="text-purple-400" />
                      AI Positioning Recommendations
                    </h2>
                    <div className="space-y-6">
                      {analysisResults.positioningRecommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg"
                        >
                          <h3 className="text-white font-semibold mb-2">{rec.title}</h3>
                          <p className="text-gray-300 text-sm mb-4">{rec.description}</p>
                          <div className="pl-4 border-l-2 border-purple-500/50">
                            <p className="text-gray-400 text-xs mb-2">Action Items:</p>
                            <ul className="space-y-1">
                              {rec.actionItems.map((action, idx) => (
                                <li key={idx} className="text-purple-300 text-sm">
                                  → {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
          </>
        )}

        {!analyzing && !analysisResults && (
          <motion.div variants={itemVariants}>
            <GlassCard className="p-12 text-center">
              <Brain className="w-20 h-20 mx-auto text-purple-400 mb-6 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to Analyze Your SaaS Product?
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Run AI-powered analysis to discover market gaps, competitor insights, pricing
                opportunities, and strategic recommendations.
              </p>
              <PrimaryButton
                onClick={runAnalysis}
                className="mx-auto"
              >
                <Brain size={24} />
                Run AI Analysis Now
              </PrimaryButton>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </motion.main>
  )
}


