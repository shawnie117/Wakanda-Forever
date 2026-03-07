import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingOverlay from './LoadingOverlay'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#05010a] via-[#120022] to-[#2a0050] flex items-center justify-center">
        <LoadingOverlay fullscreen={true} subtitle="AUTHENTICATING SESSION" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
