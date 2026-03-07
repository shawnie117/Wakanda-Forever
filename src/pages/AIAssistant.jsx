import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard'
import { Send, MessageCircle, Sparkles, Bot, User } from 'lucide-react'

const AI_BASE = import.meta.env.VITE_AI_API_URL
  ? import.meta.env.VITE_AI_API_URL.replace(/\/+$/, '')
  : 'http://localhost:8000/api/v1'

const suggestedPrompts = [
  "Why is our sentiment low?",
  "How can we beat our top competitor?",
  "What features should we add next?",
  "Analyze our pricing strategy",
  "What are our customers' pain points?",
  "Give me improvement opportunities",
]

export default function AIAssistant() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hello! I'm VIBRANIUM AI — your product intelligence assistant. I'm powered by LLaMA 3.3 70B via Groq. Ask me anything about sentiment, competitor positioning, feature gaps, pricing strategy, or improvement opportunities!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text = input) => {
    const query = text.trim()
    if (!query || isLoading) return

    const userMsg = { id: Date.now(), role: 'user', text: query }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Build history for the API (exclude system welcome message)
    const history = messages
      .filter((m) => m.id !== 1)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))

    try {
      const response = await fetch(`${AI_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history,
          context: null,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || `API error ${response.status}`)
      }

      const data = await response.json()
      const reply = data?.reply?.trim() || 'I could not generate a response. Please try again.'

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: reply,
          generatedBy: data?.generated_by,
        },
      ])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: `Sorry, I couldn't reach the AI backend. Make sure the backend is running at ${AI_BASE} and try again. (${err.message})`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white mb-4 transition-colors"
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
            <div>
              <h1 className="font-neo tracking-[0.08em] text-2xl md:text-3xl text-slate-50">
                AI Query Interface
              </h1>
              <p className="text-slate-500 text-xs mt-1">Powered by LLaMA 3.3 70B · Groq</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            Ask about product strategy, market trends, positioning, and competitor intelligence.
          </p>
        </motion.div>

        {/* Chat container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <GlassCard hoverable={false} className="p-0 flex flex-col h-[620px] md:h-[720px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mt-1">
                        <Bot size={14} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
                          : 'glass text-slate-300 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                      {message.generatedBy && (
                        <p className="text-xs text-slate-500 mt-1">
                          via {message.generatedBy}
                        </p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center mt-1">
                        <User size={14} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="flex gap-1 px-4 py-3 glass rounded-xl rounded-bl-none">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.7, delay: i * 0.12, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-purple-400"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts (shown only at start) */}
            {messages.length === 1 && !isLoading && (
              <div className="px-6 md:px-8 pb-2">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Suggested Prompts</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(prompt)}
                      className="px-4 py-2 rounded-lg border border-purple-500/30 text-purple-200 text-sm hover:border-purple-500/60 transition-all text-left"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="border-t border-purple-500/20 p-4 md:p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask me anything about your product..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 glass rounded-xl focus:outline-none transition-all focus:shadow-glow-purple disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)', scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
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
