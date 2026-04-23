import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import AuthProvider from "./components/AuthProvider.jsx";
import { NotificationProvider } from "./context/NotificationContext";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  </Provider>,
);
