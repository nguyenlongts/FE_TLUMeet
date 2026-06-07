// src/components/AuthProvider.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectRefreshToken, setCredentials } from "../redux/features/auth/authSlice";
import { useRefreshTokenMutation } from "../redux/features/auth/authApi";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const refreshToken = useSelector(selectRefreshToken);
  const [refresh] = useRefreshTokenMutation();

  useEffect(() => {
    if (!refreshToken) return;

    refresh({ refreshToken })
      .unwrap()
      .then((data) => {
        const payload = JSON.parse(atob(data.data.token.split('.')[1]))
        const roles = (payload.roles ?? [payload.role ?? payload.Role])
          .filter(Boolean)
          .map((r) => r.toString().trim().toLowerCase())
        dispatch(
          setCredentials({
            user: {
              id: data.data.id,
              email: data.data.email,
              name: data.data.name,
              roles,
            },
            accessToken: data.data.token,
            refreshToken: data.data.refreshToken,
          }),
        );
      })
      .catch(() => {
        dispatch(logout());
      });
  }, []); // Chỉ chạy 1 lần khi app khởi động

  return children;
};

export default AuthProvider;