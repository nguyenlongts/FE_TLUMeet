import React, { useEffect } from "react";
import AppRoutes from "./routes/router";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";
import Sidebar from "./pages/dashboard/Sidebar";
import Header from "./pages/dashboard/Header";
import InvitePopup from "./components/InvitePopup";
import { SearchProvider } from "./context/SearchContext";

function App() {
  return (
    <>
      {/* <InvitePopup /> */}
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
      <SearchProvider>
        <div className="flex w-full h-screen">
          <Sidebar />
          <div className="flex flex-col w-full bg-[var(--surface)]">
            <Header />
            <Outlet />
          </div>
        </div>
      </SearchProvider>
    </>
  );
}

export default App;
