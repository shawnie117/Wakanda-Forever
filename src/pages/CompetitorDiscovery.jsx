import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import PrimaryButton from '../components/PrimaryButton'
import {
  Search,
  Globe,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  ExternalLink,
  Zap,
  Target,
} from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export default function CompetitorDiscovery() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState([])

  // Mock discovered competitors
  const competitors = [
    {
      name: 'CompetitorX',
      website: 'https://competitorx.com',
      category: 'Analytics',
      pricing: '$89-$499/mo',
      users: '50K+',
      rating: 4.7,
      features: ['AI Analytics', 'Real-time Dashboard', 'API Access', 'Team Collaboration'],
      foundOn: ['Product Hunt', 'G2', 'Capterra'],
    },
    {
      name: 'RivalTech',
      website: 'https://rivaltech.io',
      category: 'Analytics',
      pricing: '$79-$399/mo',
      users: '35K+',
      rating: 4.5,
      features: ['Custom Reports', 'Data Visualization', 'Integrations', 'Mobile App'],
      foundOn: ['AppSumo', 'G2'],
    },
    {
      name: 'InsightPro',
      website: 'https://insightpro.com',
      category: 'Analytics',
      pricing: '$99-$599/mo',
      users: '80K+',
      rating: 4.8,
      features: ['Predictive Analytics', 'ML Models', 'White-label', 'Advanced Security'],
      foundOn: ['Product Hunt', 'Capterra', 'G2'],
    },
  ]

  // Positioning map data
  const positioningData = [
    { name: 'Your Product', price: 49, complexity: 65, size: 400, color: '#a855f7' },
    { name: 'CompetitorX', price: 89, complexity: 75, size: 500, color: '#c084fc' },
    { name: 'RivalTech', price: 79, complexity: 60, size: 350, color: '#3b82f6' },
    { name: 'InsightPro', price: 99, complexity: 85, size: 800, color: '#10b981' },
  ]

  const platforms = [
    'Product Hunt',
    'AppSumo',
    'G2',
    'Capterra',
    'Shopify App Store',
    'Google Workspace Marketplace',
  ]

  const handleSearch = () => {
    setSearching(true)
    setTimeout(() => setSearching(false), 2000)
  }

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
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

  const PositioningTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null

    const point = payload[0].payload

    return (
      <div className="bg-[#1e1b4b] border border-white/20 rounded-lg p-3 shadow-xl min-w-[180px]">
        <p className="text-white font-semibold mb-2">{point.name}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-300">Starting Price: <span className="text-purple-300 font-medium">${point.price}</span></p>
          <p className="text-gray-300">Complexity: <span className="text-blue-300 font-medium">{point.complexity}/100</span></p>
          <p className="text-gray-300">Market Share: <span className="text-green-300 font-medium">{Math.round(point.size / 10)}%</span></p>
        </div>
      </div>
    )
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
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            AI Competitor Discovery
          </h1>
          <p className="text-gray-400">
            Automatically discover and analyze your SaaS competitors across platforms
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Search size={24} className="text-purple-400" />
              Discover Competitors
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Search Keywords (e.g., "SaaS analytics tool", "product intelligence")
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter search keywords..."
                    className="vibranium-input flex-1"
                  />
                  <PrimaryButton
                    onClick={handleSearch}
                    disabled={searching || !searchQuery}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search size={20} />
                    {searching ? 'Searching...' : 'Search'}
                  </PrimaryButton>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Select Platforms to Search
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        selectedPlatforms.includes(platform)
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* SaaS Market Positioning Map */}
        <motion.div variants={itemVariants} className="mb-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target size={24} className="text-blue-400" />
              SaaS Market Positioning Map
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Visual competitive positioning: Price vs Feature Complexity (bubble size = market
              share)
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  type="number"
                  dataKey="price"
                  name="Price"
                  domain={[0, 110]}
                  stroke="#9ca3af"
                  tickFormatter={(value) => `$${value}`}
                  label={{ value: 'Starting Price ($)', position: 'insideBottom', offset: -8 }}
                />
                <YAxis
                  type="number"
                  dataKey="complexity"
                  name="Feature Complexity"
                  domain={[0, 100]}
                  width={70}
                  stroke="#9ca3af"
                  label={{
                    value: 'Feature Complexity Score',
                    angle: -90,
                    position: 'insideLeft',
                    dx: -6,
                  }}
                />
                <ZAxis type="number" dataKey="size" range={[120, 900]} name="Market Share" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={<PositioningTooltip />}
                />
                <Scatter name="Products" data={positioningData}>
                  {positioningData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-5 flex-wrap">
              {positioningData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Discovered Competitors */}
        <motion.div variants={itemVariants}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">Discovered Competitors</h2>
            <p className="text-gray-400 text-sm">
              {competitors.length} competitors found across selected platforms
            </p>
          </div>

          <div className="space-y-6">
            {competitors.map((competitor, index) => (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard className="p-6 hover:shadow-purple-500/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{competitor.name}</h3>
                      <a
                        href={competitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-2"
                      >
                        {competitor.website} <ExternalLink size={14} />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
                      <Star className="text-yellow-400" size={20} />
                      <span className="text-white font-bold">{competitor.rating}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Category</p>
                      <p className="text-white font-semibold">{competitor.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Pricing</p>
                      <p className="text-white font-semibold flex items-center gap-1">
                        <DollarSign size={16} className="text-green-400" />
                        {competitor.pricing}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">User Base</p>
                      <p className="text-white font-semibold flex items-center gap-1">
                        <Users size={16} className="text-blue-400" />
                        {competitor.users}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Found On</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.foundOn.map((platform, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                      <Zap size={16} className="text-purple-400" />
                      Key Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {competitor.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
                    <button className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm font-medium">
                      Analyze in Detail
                    </button>
                    <button className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm font-medium">
                      Add to Comparison
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Market Gap Insights */}
        <motion.div variants={itemVariants} className="mt-8">
          <GlassCard className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-green-400" />
              AI-Generated Market Gap Insights
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-2">
                  Missing Feature: Advanced Mobile App
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  85% of top competitors offer native mobile applications with offline
                  capabilities. Your product currently lacks this feature.
                </p>
                <p className="text-purple-300 text-sm font-medium">
                  Opportunity: Adding mobile app could increase market penetration by 18-25%
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-2">
                  Pricing Gap: Enterprise Tier Opportunity
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  Competitors capture 40% more revenue with enterprise tiers at $500-$1,000/mo.
                  Your max tier is $299/mo.
                </p>
                <p className="text-green-300 text-sm font-medium">
                  Opportunity: Enterprise tier with white-label could unlock $50K+ MRR
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.main>
  )
}


