import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'

export default function PostLoginLoader() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return <LoadingScreen />
}
