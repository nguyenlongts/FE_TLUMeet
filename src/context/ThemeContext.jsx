import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "theme";

// Áp class ngay khi import (trước render) để tránh nhấp nháy sai theme.
const applyThemeClass = (theme) => {
  const root = document.documentElement;
  if (theme === "light") root.classList.add("light");
  else root.classList.remove("light");
};

const getInitialTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

applyThemeClass(getInitialTheme());

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* localStorage không khả dụng thì bỏ qua */ }
  }, [theme]);

  const setTheme = (t) => setThemeState(t === "light" ? "light" : "dark");
  const toggleTheme = () =>
    setThemeState((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme !== "light", setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
