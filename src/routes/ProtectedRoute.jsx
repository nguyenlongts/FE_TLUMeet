// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { selectAccessToken, selectIsRestoring, selectRefreshToken } from "../redux/features/auth/authSlice";

const ProtectedRoute = () => {
  const { t } = useTranslation();
  const accessToken = useSelector(selectAccessToken);
  const refreshToken=useSelector(selectRefreshToken)
  const isStoring=useSelector(selectIsRestoring)

  if(isStoring) return <>{t('common.loading')}</>
  if (!refreshToken) {
    return <Navigate to="/login"  />;
  }
// import {
//   selectAccessToken,
//   selectIsRestoring,
//   selectRefreshToken,
// } from "../redux/features/auth/authSlice";

// const ProtectedRoute = () => {
//   const accessToken = useSelector(selectAccessToken);
//   const refreshToken = useSelector(selectRefreshToken);
//   const isRestoring = useSelector(selectIsRestoring);

//   if (isRestoring)
//     return (
//       <div className="flex items-center justify-center w-full h-screen bg-[var(--surface)]">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
//           <p className="text-[var(--muted)] text-sm">Đang tải...</p>
//         </div>
//       </div>
//     );

//   if (!refreshToken) return <Navigate to="/login" />;

  return <Outlet />;
};

export default ProtectedRoute;
