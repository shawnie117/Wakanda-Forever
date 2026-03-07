import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signOut } from 'firebase/auth'
import { Menu, X, LogOut, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { auth } from '../firebase/firebaseConfig'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analyze', path: '/analyze' },
    { name: 'Compare', path: '/compare' },
    { name: 'Market Radar', path: '/market-radar' },
    { name: 'Insights', path: '/insights' },
    { name: 'AI Assistant', path: '/assistant' },
  ]

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          {user ? (
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="font-neo tracking-[0.08em] text-2xl uppercase text-slate-100"
              >
                VIBRANIUM
              </motion.div>
            </Link>
          ) : (
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="font-neo tracking-[0.08em] text-2xl uppercase text-slate-100"
              >
                VIBRANIUM
              </motion.div>
            </Link>
          )}

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="text-sm font-medium text-slate-300 hover:text-purple-300 transition-all duration-200 cursor-pointer"
                  >
                    {link.name}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* User Profile / Login Button */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm text-gray-300 truncate">{user.email}</span>
                </motion.button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden z-50"
                  >
                    <Link to="/my-analyses" onClick={() => setShowProfile(false)}>
                      <div className="flex items-center gap-2 px-4 py-3 hover:bg-white/20 transition-colors cursor-pointer text-gray-300">
                        <FileText size={18} />
                        My Analyses
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfile(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-500/20 transition-colors cursor-pointer text-red-300 border-t border-white/10"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <Link to="/login">
                  <motion.button
                    whileHover={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)' }}
                    className="px-4 py-2 border border-purple-600/60 text-slate-100 rounded-lg hover:bg-purple-600/10 transition-all"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.8)' }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-purple-300 p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden pb-4 space-y-2"
          >
            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
              >
                <div className="text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">
                  {link.name}
                </div>
              </Link>
            ))}
            {user && (
              <>
                <Link to="/my-analyses" onClick={() => setIsOpen(false)}>
                  <div className="text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-white/10 transition-colors">
                    My Analyses
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="w-full text-left text-red-300 font-medium py-2 px-4 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <div className="space-y-2 pt-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-2 border border-purple-500/50 text-purple-300 rounded-lg">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  )
}
