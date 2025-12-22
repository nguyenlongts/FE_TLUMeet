import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);
const token = localStorage.getItem("token");

function decodeJWT(token) {
  try {
    if (!token) return null;

    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser && token) {
      const parsed = JSON.parse(savedUser);
      const decoded = decodeJWT(token);

      if (!decoded || decoded.exp * 1000 < Date.now()) {
        logout();
      } else {
        setUser(parsed);
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userInfo, token) => {
    if (!token) {
      console.error("login() requires token");
      return;
    }
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
