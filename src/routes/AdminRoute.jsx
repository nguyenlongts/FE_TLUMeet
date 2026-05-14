import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
    console.log(user, "ú")
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== 'Admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminRoute;