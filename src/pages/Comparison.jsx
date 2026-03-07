import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import AnalyticsCard from '../components/AnalyticsCard'
import { Check, X, AlertCircle, Download, TrendingUp, BarChart3, Star } from 'lucide-react'
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// Sample products data
const productsDatabase = [
  { id: 1, name: 'Camlin Scissors', category: 'Scissors' },
  { id: 2, name: 'Faber-Castell Scissors', category: 'Scissors' },
  { id: 3, name: 'Apsara Scissors', category: 'Scissors' },
  { id: 4, name: 'Maped Scissors', category: 'Scissors' },
  { id: 5, name: 'Westcott Scissors', category: 'Scissors' },
]

// Price comparison data
const getPriceData = (productName) => [
  { name: productName, price: 15, color: '#9333ea' },
  { name: 'Competitor A', price: 18, color: '#ec4899' },
  { name: 'Competitor B', price: 16, color: '#06b6d4' },
  { name: 'Competitor C', price: 20, color: '#f59e0b' },
]

// Sentiment data
const getSentimentData = () => [
  { metric: 'Quality', Your: 85, CompA: 78, CompB: 82, CompC: 75 },
  { metric: 'Price Value', Your: 72, CompA: 68, CompB: 75, CompC: 65 },
  { metric: 'Design', Your: 88, CompA: 80, CompB: 85, CompC: 79 },
  { metric: 'Durability', Your: 84, CompA: 76, CompB: 80, CompC: 78 },
  { metric: 'Support', Your: 79, CompA: 71, CompB: 77, CompC: 72 },
]

// Radar chart data
const getRadarData = () => [
  { category: 'Durability', Your: 84, CompA: 76, CompB: 80, CompC: 78 },
  { category: 'Price', Your: 72, CompA: 68, CompB: 75, CompC: 65 },
  { category: 'Features', Your: 88, CompA: 80, CompB: 85, CompC: 79 },
  { category: 'Support', Your: 79, CompA: 71, CompB: 77, CompC: 72 },
  { category: 'Brand Rep', Your: 82, CompA: 75, CompB: 78, CompC: 70 },
]

// Features comparison
const getFeatures = () => [
  { name: 'Stainless Steel', your: true, compA: true, compB: true, compC: false },
  { name: 'Ergonomic Grip', your: true, compA: false, compB: true, compC: true },
  { name: 'Rust Resistant', your: true, compA: true, compB: false, compC: false },
  { name: '5-Year Warranty', your: true, compA: true, compB: true, compC: false },
  { name: 'Comfortable Handle', your: true, compA: true, compB: true, compC: true },
  { name: 'Lifetime Warranty', your: false, compA: true, compB: false, compC: true },
  { name: 'Anti-slip', your: true, compA: false, compB: true, compC: true },
  { name: 'Lightweight', your: true, compA: true, compB: true, compC: false },
]

// Market position scores
const getMarketScores = () => [
  { name: 'Your Product', score: 84 },
  { name: 'Competitor A', score: 76 },
  { name: 'Competitor B', score: 81 },
  { name: 'Competitor C', score: 73 },
]

// AI Strategy recommendations
const getStrategies = () => [
  '• Improve rust-resistant coating technology',
  '• Add lifetime warranty option to compete',
  '• Reduce price point by 5-8% for better market penetration',
  '• Enhance ergonomic design based on competitor analysis',
  '• Develop premium line with advanced features',
  '• Focus marketing on durability advantages',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function Comparison() {
  const [yourProduct, setYourProduct] = useState('Camlin Scissors')
  const [competitors, setCompetitors] = useState([
    'Faber-Castell Scissors',
    'Apsara Scissors',
    'Maped Scissors',
  ])
  const [selectedCompetitors, setSelectedCompetitors] = useState(competitors)

  const handleCompetitorToggle = (competitor) => {
    if (selectedCompetitors.includes(competitor)) {
      setSelectedCompetitors(selectedCompetitors.filter((c) => c !== competitor))
    } else if (selectedCompetitors.length < 3) {
      setSelectedCompetitors([...selectedCompetitors, competitor])
    }
  }

  const priceData = getPriceData(yourProduct)
  const sentimentData = getSentimentData()
  const radarData = getRadarData()
  const featuresList = getFeatures()
  const marketScores = getMarketScores()
  const strategies = getStrategies()

  // Feature gap analysis
  const competitorFeatures = featuresList
    .filter((f) => (f.compA || f.compB || f.compC) && !f.your)
    .map((f) => f.name)

  const downloadReport = () => {
    const report = `
COMPETITIVE ANALYSIS REPORT
===========================
Product: ${yourProduct}
Compared Against: ${selectedCompetitors.join(', ')}

Market Position: 84/100
Overall Advantage: Strong

Key Recommendations:
${strategies.join('\n')}

Generated: ${new Date().toLocaleDateString()}
    `.trim()

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report))
    element.setAttribute('download', `comparison_report_${Date.now()}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6 py-12"
    >
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-12"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Competitive Intelligence
          </h1>
          <p className="text-gray-300 text-lg">
            Analyze your product against competitors and identify strategic opportunities.
          </p>
        </motion.div>
      </motion.div>

      {/* SECTION 1: PRODUCT SELECTOR */}
      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <GlassCard hoverable={false} className="p-8">
          <h2 className="subsection-title mb-6">Your Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Your Product Selection */}
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-3">
                Select Your Product
              </label>
              <select
                value={yourProduct}
                onChange={(e) => setYourProduct(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              >
                {productsDatabase.map((p) => (
                  <option key={p.id} value={p.name} className="bg-gray-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Competitors Selection */}
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-3">
                Compare With (Max 3)
              </label>
              <div className="space-y-2">
                {productsDatabase
                  .filter((p) => p.name !== yourProduct)
                  .map((p) => (
                    <motion.label
                      key={p.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompetitors.includes(p.name)}
                        onChange={() => handleCompetitorToggle(p.name)}
                        disabled={
                          !selectedCompetitors.includes(p.name) &&
                          selectedCompetitors.length >= 3
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-gray-300">{p.name}</span>
                    </motion.label>
                  ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* SECTION 2 & 3: CHARTS GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
      >
        {/* Price Comparison */}
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={false} className="p-8">
            <h3 className="subsection-title mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-400" />
              Price Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceData}>
                <defs>
                  <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.2)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 26, 0.95)',
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                  formatter={(value) => `$${value}`}
                />
                <Bar dataKey="price" fill="url(#colorPurple)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Sentiment Comparison */}
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={false} className="p-8">
            <h3 className="subsection-title mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-pink-400" />
              Sentiment Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.2)" />
                <XAxis dataKey="metric" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 26, 0.95)',
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Bar dataKey="Your" fill="#a855f7" radius={[8, 8, 0, 0]} />
                <Bar dataKey="CompA" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="CompB" fill="#ec4899" radius={[8, 8, 0, 0]} />
                <Bar dataKey="CompC" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* SECTION 4: FEATURE COMPARISON TABLE */}
      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <GlassCard hoverable={false} className="p-8 overflow-x-auto">
          <h3 className="subsection-title mb-6 flex items-center gap-2">
            <Check size={20} className="text-green-400" />
            Feature Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left py-4 px-4 text-purple-300 font-semibold">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 text-purple-300 font-semibold">
                    {yourProduct}
                  </th>
                  {selectedCompetitors.length > 0 &&
                    selectedCompetitors.map((comp) => (
                      <th key={comp} className="text-center py-4 px-4 text-cyan-300 font-semibold">
                        {comp}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {featuresList.map((feature, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-300 font-medium">{feature.name}</td>
                    <td className="text-center py-4 px-4">
                      {feature.your ? (
                        <Check className="text-green-400 mx-auto" size={20} />
                      ) : (
                        <X className="text-red-400 mx-auto" size={20} />
                      )}
                    </td>
                    {selectedCompetitors.includes('Faber-Castell Scissors') && (
                      <td className="text-center py-4 px-4">
                        {feature.compA ? (
                          <Check className="text-green-400 mx-auto" size={20} />
                        ) : (
                          <X className="text-red-400 mx-auto" size={20} />
                        )}
                      </td>
                    )}
                    {selectedCompetitors.includes('Apsara Scissors') && (
                      <td className="text-center py-4 px-4">
                        {feature.compB ? (
                          <Check className="text-green-400 mx-auto" size={20} />
                        ) : (
                          <X className="text-red-400 mx-auto" size={20} />
                        )}
                      </td>
                    )}
                    {selectedCompetitors.includes('Maped Scissors') && (
                      <td className="text-center py-4 px-4">
                        {feature.compC ? (
                          <Check className="text-green-400 mx-auto" size={20} />
                        ) : (
                          <X className="text-red-400 mx-auto" size={20} />
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* SECTION 5: RADAR CHART */}
      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <GlassCard hoverable={false} className="p-8">
          <h3 className="subsection-title mb-6 flex items-center gap-2">
            <Star size={20} className="text-yellow-400" />
            Multi-Dimensional Analysis
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(168, 85, 247, 0.2)" />
              <PolarAngleAxis dataKey="category" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar
                name="Your Product"
                dataKey="Your"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.6}
              />
              <Radar
                name="Competitor A"
                dataKey="CompA"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.4}
              />
              <Radar
                name="Competitor B"
                dataKey="CompB"
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.4}
              />
              <Radar
                name="Competitor C"
                dataKey="CompC"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.4}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 26, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  borderRadius: '8px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* SECTION 6: FEATURE GAP ANALYSIS */}
      {competitorFeatures.length > 0 && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <GlassCard hoverable={false} className="p-8 border-l-4 border-yellow-500">
            <h3 className="subsection-title mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-400" />
              Feature Gap Detection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-yellow-300 mb-4">
                  Missing Features (Competitors Have)
                </h4>
                <div className="space-y-2">
                  {competitorFeatures.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2 text-red-300"
                    >
                      <X size={16} />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-yellow-500/30">
                <h4 className="text-sm font-semibold text-yellow-300 mb-3">
                  Priority Action Items
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Evaluate adding missing features</li>
                  <li>✓ Assess market demand for gaps</li>
                  <li>✓ Plan product roadmap updates</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* SECTION 7: MARKET POSITION SCORE */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
      >
        {marketScores.map((score, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <AnalyticsCard
              title={score.name}
              value={`${score.score}/100`}
              description={
                score.name === 'Your Product'
                  ? 'Strong Position'
                  : 'Competitive'
              }
            />
          </motion.div>
        ))}
      </motion.div>

      {/* SECTION 8: AI STRATEGY RECOMMENDATIONS */}
      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <GlassCard hoverable={false} className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <h3 className="subsection-title mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-400" />
            AI Strategic Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strategy, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-colors"
              >
                <div className="text-green-400 font-bold min-w-fit">→</div>
                <p className="text-gray-300">{strategy}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* SECTION 9: EXPORT REPORT */}
      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)', scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadReport}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
        >
          <Download size={20} />
          Download Comparison Report
        </motion.button>
      </motion.div>
    </motion.main>
  )
}
