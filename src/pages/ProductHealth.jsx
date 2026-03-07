import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import AnalyticsCard from '../components/AnalyticsCard'
import {
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  Target,
  Heart,
  BarChart3,
  Clock,
  Award,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function ProductHealth() {
  const navigate = useNavigate()

  // Mock data for product health metrics
  const userGrowthData = [
    { month: 'Jan', dau: 1200, mau: 15000 },
    { month: 'Feb', dau: 1500, mau: 18000 },
    { month: 'Mar', dau: 1800, mau: 22000 },
    { month: 'Apr', dau: 2200, mau: 27000 },
    { month: 'May', dau: 2800, mau: 33000 },
    { month: 'Jun', dau: 3500, mau: 42000 },
  ]

  const revenueData = [
    { month: 'Jan', mrr: 45000, arpu: 35 },
    { month: 'Feb', mrr: 52000, arpu: 37 },
    { month: 'Mar', mrr: 61000, arpu: 38 },
    { month: 'Apr', mrr: 72000, arpu: 40 },
    { month: 'May', mrr: 85000, arpu: 42 },
    { month: 'Jun', mrr: 98000, arpu: 45 },
  ]

  const engagementData = [
    { metric: 'Feature A', usage: 85 },
    { metric: 'Feature B', usage: 72 },
    { metric: 'Feature C', usage: 68 },
    { metric: 'Feature D', usage: 55 },
    { metric: 'Feature E', usage: 42 },
  ]

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
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Product Health Dashboard
          </h1>
          <p className="text-gray-400">Monitor key product metrics and KPIs for your SaaS</p>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <AnalyticsCard
              title="Daily Active Users"
              value="3,500"
              subtitle="+28% from last month"
              Icon={Users}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AnalyticsCard
              title="Monthly Recurring Revenue"
              value="$98K"
              subtitle="+15% growth"
              Icon={DollarSign}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AnalyticsCard
              title="Churn Rate"
              value="3.2%"
              subtitle="Below industry avg"
              Icon={Activity}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AnalyticsCard
              title="NPS Score"
              value="72"
              subtitle="Excellent rating"
              Icon={Heart}
            />
          </motion.div>
        </motion.div>

        {/* User Growth Charts */}
        <motion.div variants={itemVariants} className="mb-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-400" />
              User Growth Metrics
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="dau"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorDau)"
                  name="Daily Active Users"
                />
                <Area
                  type="monotone"
                  dataKey="mau"
                  stroke="#c084fc"
                  fillOpacity={1}
                  fill="url(#colorMau)"
                  name="Monthly Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Revenue Metrics */}
        <motion.div variants={itemVariants} className="mb-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign size={24} className="text-green-400" />
              Revenue Metrics
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mrr"
                  stroke="#a855f7"
                  strokeWidth={2}
                  name="Monthly Recurring Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="arpu"
                  stroke="#c084fc"
                  strokeWidth={2}
                  name="ARPU ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Feature Engagement */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={24} className="text-blue-400" />
                Feature Usage Rate
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="metric" type="category" stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e1b4b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="usage" fill="#a855f7" name="Usage %" />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Additional Metrics */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target size={24} className="text-purple-400" />
                Key Performance Indicators
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Customer Retention Rate</span>
                    <span className="text-green-400 font-semibold">96.8%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: '96.8%' }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Activation Rate</span>
                    <span className="text-purple-400 font-semibold">78%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Customer Satisfaction (CSAT)</span>
                    <span className="text-yellow-400 font-semibold">4.6/5</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Time to Value</span>
                    <span className="text-blue-400 font-semibold">2.3 days</span>
                  </div>
                  <p className="text-xs text-gray-500">Average time to first value</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Customer Lifetime Value</span>
                    <span className="text-green-400 font-semibold">$1,840</span>
                  </div>
                  <p className="text-xs text-gray-500">Average LTV per customer</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Market Metrics */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award size={24} className="text-yellow-400" />
              Market Performance Metrics
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/5 rounded-lg">
                <Clock className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                <p className="text-3xl font-bold text-white mb-2">42%</p>
                <p className="text-gray-400 text-sm">Market Share</p>
                <p className="text-xs text-green-400 mt-1">↑ 8% from last quarter</p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-lg">
                <Target className="w-12 h-12 mx-auto text-blue-400 mb-3" />
                <p className="text-3xl font-bold text-white mb-2">87%</p>
                <p className="text-gray-400 text-sm">Competitive Feature Coverage</p>
                <p className="text-xs text-yellow-400 mt-1">13% gap remaining</p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-lg">
                <DollarSign className="w-12 h-12 mx-auto text-green-400 mb-3" />
                <p className="text-3xl font-bold text-white mb-2">92</p>
                <p className="text-gray-400 text-sm">Pricing Competitiveness Score</p>
                <p className="text-xs text-green-400 mt-1">Optimally positioned</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.main>
  )
}


