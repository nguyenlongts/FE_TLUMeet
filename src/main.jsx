import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import { Provider } from 'react-redux'
import {store} from './redux/store.js'
import AuthProvider from "./components/AuthProvider.jsx";
import { Toaster } from "react-hot-toast";
import './configs/i18n.config.js'
import { ConfigProvider, theme as antdTheme } from "antd";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";

// Cầu nối: antd dùng dark/light algorithm theo theme hiện tại
function AntdThemeBridge({ children }) {
  const { isDark } = useTheme();
  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: isDark ? "#7c3aed" : "#0284c7", borderRadius: 10 },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <Provider store={store} >
    <ThemeProvider>
      <AntdThemeBridge>
        <AuthProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <RouterProvider router={router}/>
        </AuthProvider>
      </AntdThemeBridge>
    </ThemeProvider>
  </Provider>
);
