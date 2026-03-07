import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import { Send, MessageCircle, Sparkles } from 'lucide-react'

const suggestedPrompts = [
  "Why is our sentiment low?",
  "Compare with competitor A",
  "What feature should we improve?",
  "Analyze pricing strategy",
  "Show customer pain points",
  "Best improvement opportunities",
]

const dummyResponses = {
  "why is our sentiment low?":
    "Based on our analysis, sentiment is lower due to three main factors: 1) Battery life concerns (28% of complaints), 2) Higher price point compared to competitors (15% premium), and 3) Complex user interface that needs simplification. I recommend prioritizing these three areas to boost sentiment by approximately 12-15% within 3 months.",

  "compare with competitor a":
    "Competitor A leads in price (12% cheaper) and has superior battery life rating, but falls behind in build quality and customer support. Our product maintains advantages in innovation and feature richness. Overall market position: We're ranked #2 with a 92/100 strength score vs their 87/100.",

  "what feature should we improve?":
    "The most requested feature is real-time sync capability with 450+ mentions in recent reviews. Implementation would significantly improve user satisfaction. Secondary priorities are: offline mode support, dark theme UI, and enhanced notification system. Real-time sync alone could increase satisfaction by 18%.",

  "analyze pricing strategy":
    "Current pricing is 12% above market average. Competitive analysis shows optimal pricing at current cost point generates maximum profit margin. However, a 5% reduction could increase market penetration by 15% while maintaining healthy margins. Recommendation: Consider tiered pricing with entry-level option at $24.99.",

  "show customer pain points":
    "Top customer pain points: 1) Ergonomic grip design (23%), 2) Battery endurance (28%), 3) Price sensitivity (34%), 4) Learning curve (19%), 5) Limited customization (15%). Focus on addressing grip design and battery issues first as they impact both satisfaction and repeat purchase rates.",

  "best improvement opportunities":
    "Highest ROI improvements: 1) Ergonomic redesign (High impact, Medium effort), 2) Price reduction 5% (High impact, Low effort), 3) Real-time sync feature (High impact, High effort), 4) Enhanced customer support (Medium impact, Medium effort). Quick wins: Price adjustment and support improvements."
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function AIAssistant() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: "Hello! I'm your AI Product Intelligence Assistant. I can help you analyze sentiment, compare competitors, identify improvement opportunities, and answer strategic questions about your product. Try asking me anything about your product's market position!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (text = input) => {
    if (!text.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const responseKey = text.toLowerCase()
      const response =
        Object.keys(dummyResponses).find((key) => responseKey.includes(key)) || 'compare with competitor a'

      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant',
        text: dummyResponses[response],
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

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
        className="mb-8"
      >
        <motion.div variants={itemVariants}>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <p className="font-neo tracking-[0.08em] text-xs uppercase text-slate-400 mb-2">
            Conversational Intelligence
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30">
              <Sparkles className="text-purple-300" size={32} />
            </div>
            <h1 className="font-neo tracking-[0.08em] text-2xl md:text-3xl text-slate-50">AI Query Interface</h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            Ask about product strategy, market trends, positioning, and competitor intelligence.
          </p>
        </motion.div>
      </motion.div>

      {/* Main Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-5xl mx-auto"
      >
        <GlassCard hoverable={false} className="p-0 flex flex-col h-[600px] md:h-[700px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
            <AnimatePresence>
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-xl px-4 py-3 rounded-xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
                            : 'glass text-slate-300 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <MessageCircle className="text-purple-400" size={20} />
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-purple-400"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-purple-500/20 p-4 md:p-6 space-y-4">
            {messages.length === 1 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-xs text-gray-400 font-semibold uppercase">Suggested Prompts</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-4 py-2 rounded-lg border border-purple-500/30 text-purple-200 text-sm hover:border-purple-500/60 transition-all text-left"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSendMessage()
                  }
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 glass rounded-xl focus:outline-none transition-all focus:shadow-glow-purple disabled:opacity-50"
              />
              <motion.button
                whileHover={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="glow-button flex-shrink-0 disabled:opacity-50"
              >
                <Send size={20} />
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
      </div>
    </motion.main>
  )
}


