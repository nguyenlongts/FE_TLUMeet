import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../redux/features/auth/authSlice'

const PublicRoute = ({ children }) => {
  const user = useSelector(selectCurrentUser)
  if (user) {
    const isAdmin = (user.roles ?? []).some((r) => r.includes('admin'))
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
  }
  return children
}

export default PublicRoute