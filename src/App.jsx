import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./pages/dashboard/Sidebar";
import Header from "./pages/dashboard/Header";
import { SearchProvider } from "./context/SearchContext";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SearchProvider>
      <div className="flex w-full h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* min-w-0 cho phép cột nội dung co lại trên màn nhỏ (tránh tràn ngang) */}
        <div className="flex flex-col flex-1 min-w-0 bg-[var(--surface)]">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <Outlet />
        </div>
      </div>
    </SearchProvider>
  );
}

export default App;
