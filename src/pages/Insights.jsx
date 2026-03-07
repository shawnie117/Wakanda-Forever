import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import { Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  PieChart,
  Pie,
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

const sentimentBreakdown = [
  { name: 'Positive', value: 65, fill: '#10b981' },
  { name: 'Neutral', value: 20, fill: '#6366f1' },
  { name: 'Negative', value: 15, fill: '#ef4444' },
]

const trendData = [
  { week: 'Week 1', positive: 58, neutral: 25, negative: 17 },
  { week: 'Week 2', positive: 62, neutral: 22, negative: 16 },
  { week: 'Week 3', positive: 65, neutral: 20, negative: 15 },
  { week: 'Week 4', positive: 68, neutral: 18, negative: 14 },
  { week: 'Week 5', positive: 72, neutral: 17, negative: 11 },
  { week: 'Week 6', positive: 75, neutral: 16, negative: 9 },
]

const recommendations = [
  {
    id: 1,
    title: 'Improve Ergonomic Design',
    description: 'Customer feedback indicates 23% of complaints relate to grip comfort. Consider redesigning the handle with textured materials.',
    impact: 'High',
    effort: 'Medium',
  },
  {
    id: 2,
    title: 'Reduce Product Price by 5%',
    description: 'Competitive analysis shows pricing is 8-12% higher than competitors. A 5% reduction could increase market share by 15%.',
    impact: 'High',
    effort: 'Low',
  },
  {
    id: 3,
    title: 'Add Real-time Sync Feature',
    description: 'Most requested feature with 450+ mentions in reviews. Implementation would address top customer request and boost satisfaction.',
    impact: 'High',
    effort: 'High',
  },
  {
    id: 4,
    title: 'Enhance Customer Support',
    description: 'Response time complaints decreased sentiment by 12%. Implement 24/7 support chatbot for faster resolution.',
    impact: 'Medium',
    effort: 'Medium',
  },
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

export default function Insights() {
  const navigate = useNavigate()

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-12"
      >
        <motion.div variants={itemVariants}>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <p className="font-neo tracking-[0.08em] text-xs uppercase text-slate-400 mb-2">
            Strategy Layer
          </p>
          <h1 className="font-neo tracking-[0.08em] text-3xl md:text-4xl text-slate-50 mb-2">
            Intelligence Insights
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Deep signals on customer sentiment, trend movement, and strategic product opportunities.
          </p>
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
      >
        {/* Sentiment Breakdown Pie Chart */}
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={false} className="p-8 flex flex-col items-center">
            <h3 className="font-neo tracking-[0.08em] text-sm uppercase text-slate-300 mb-6 text-center">
              Sentiment Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {sentimentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4 flex-wrap justify-center">
              {sentimentBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-slate-300 text-sm">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Sentiment Trend */}
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={false} className="p-8">
            <h3 className="font-neo tracking-[0.08em] text-sm uppercase text-slate-300 mb-6">
              Sentiment Trend (6 Weeks)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="positive"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Key Insights Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
      >
        <motion.div variants={itemVariants}>
          <GlassCard hoverable={true} className="p-8 h-full">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="text-green-400" size={28} />
              <h3 className="font-neo tracking-[0.08em] text-sm uppercase text-slate-200">Top Strengths</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Exceptional build quality (94% positive)',
                'Outstanding customer support (92% satisfaction)',
                'Innovative features (88% positive)',
              ].map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard hoverable={true} className="p-8 h-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-orange-400" size={28} />
              <h3 className="font-neo tracking-[0.08em] text-sm uppercase text-slate-200">Top Complaints</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Price premium vs competitors (34%)',
                'Battery life concerns (28%)',
                'Limited color options (22%)',
              ].map((complaint, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                  <span>{complaint}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* AI Strategic Recommendations */}
      <motion.div variants={itemVariants} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }}>
        <GlassCard hoverable={false} className="p-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                <Lightbulb className="text-purple-300" size={32} />
              </div>
              <h2 className="font-neo tracking-[0.08em] text-base uppercase text-slate-100">AI Strategic Recommendations</h2>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={rec.id}
                  variants={itemVariants}
                  className="bg-white/5 border border-purple-500/20 rounded-xl p-6 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-base font-semibold text-purple-200 mb-2">{rec.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{rec.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Impact:</span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          rec.impact === 'High'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {rec.impact}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Effort:</span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          rec.effort === 'Low'
                            ? 'bg-green-500/20 text-green-300'
                            : rec.effort === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {rec.effort}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>
      </div>
    </motion.main>
  )
}


