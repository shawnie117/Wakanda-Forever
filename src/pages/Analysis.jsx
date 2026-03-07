import { useState } from 'react'
import { motion } from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Search, Star, MessageSquare, TrendingUp, Award, ChevronDown, Loader } from 'lucide-react'
import AnalyticsCard from '../components/AnalyticsCard'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/firebaseConfig'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const sentimentData = [
  { month: 'Jan', sentiment: 65, reviews: 240 },
  { month: 'Feb', sentiment: 72, reviews: 290 },
  { month: 'Mar', sentiment: 68, reviews: 320 },
  { month: 'Apr', sentiment: 78, reviews: 380 },
  { month: 'May', sentiment: 82, reviews: 420 },
  { month: 'Jun', sentiment: 88, reviews: 510 },
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

export default function Analysis() {
  const { user } = useAuth()
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('Electronics')
  const [sentimentScore, setSentimentScore] = useState(88)
  const [competitorScore, setCompetitorScore] = useState(65)
  const [loading, setLoading] = useState(false)

  const categories = ['Electronics', 'Software', 'Services', 'Fashion', 'Home & Garden']

  const handleAnalyze = async () => {
    if (!productName.trim()) {
      alert('Please enter a product name')
      return
    }

    setLoading(true)

    try {
      // Simulate random scores
      const newSentiment = Math.floor(Math.random() * 50) + 60
      const newCompetitor = Math.floor(Math.random() * 50) + 40

      setSentimentScore(newSentiment)
      setCompetitorScore(newCompetitor)

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, 'analyses'), {
          userId: user.uid,
          productName: productName,
          sentimentScore: newSentiment,
          competitorScore: newCompetitor,
          createdAt: serverTimestamp(),
        })
      }
    } catch (err) {
      console.error('Error saving analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 md:px-6 py-12"
    >
      {/* Search Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Product Analysis
          </h1>
          <p className="text-gray-300 text-lg">
            Enter a product name and select a category to analyze market sentiment and performance.
          </p>
        </motion.div>

        {/* Search Bar and Dropdown */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-purple-400" size={20} />
            <motion.input
              whileFocus={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}
              type="text"
              placeholder="Enter Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all text-white placeholder-gray-500"
            />
          </div>

          <div className="relative min-w-40">
            <ChevronDown className="absolute right-4 top-4 text-purple-400 pointer-events-none" size={20} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl focus:outline-none appearance-none cursor-pointer transition-all focus:shadow-lg focus:shadow-purple-500/20 text-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)', scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : 'Analyze'}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
      >
        <motion.div variants={itemVariants}>
          <AnalyticsCard
            title="Average Rating"
            value="4.8"
            subtitle="Out of 5.0"
            Icon={Star}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AnalyticsCard
            title="Total Reviews"
            value="12.4K"
            subtitle="This quarter"
            Icon={MessageSquare}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AnalyticsCard
            title="Sentiment Score"
            value={`${sentimentScore}%`}
            subtitle="Positive sentiment"
            Icon={TrendingUp}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AnalyticsCard
            title="Market Position"
            value={`${competitorScore}%`}
            subtitle="vs competitors"
            Icon={Award}
          />
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Sentiment Trend Chart */}
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={false} className="p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Sentiment Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentData}>
                <defs>
                  <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.2)" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(5, 1, 10, 0.9)',
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ fill: '#ec4899', r: 5 }}
                  activeDot={{ r: 7 }}
                  fill="url(#colorSentiment)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Review Volume Chart */}
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={false} className="p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Review Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sentimentData}>
                <defs>
                  <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.2)" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(5, 1, 10, 0.9)',
                    border: '1px solid rgba(236, 72, 153, 0.5)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Bar
                  dataKey="reviews"
                  fill="url(#colorReviews)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={true} className="p-8">
            <h3 className="text-xl font-bold text-white mb-4">Top Strengths</h3>
            <ul className="space-y-3">
              {['Great build quality', 'Excellent customer service', 'Good value for money'].map(
                (strength, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                    {strength}
                  </li>
                )
              )}
            </ul>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard hoverable={true} className="p-8">
            <h3 className="text-xl font-bold text-white mb-4">Areas for Improvement</h3>
            <ul className="space-y-3">
              {['Battery life could be longer', 'Price is slightly high', 'User manual needs clarity'].map(
                (issue, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                    {issue}
                  </li>
                )
              )}
            </ul>
          </GlassCard>
        </motion.div>
      </motion.div>
    </motion.main>
  )
}
