import React, { useEffect } from "react";
import AppRoutes from "./routes/router";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";
import Sidebar from "./pages/dashboard/Sidebar";
import Header from "./pages/dashboard/Header";
import InvitePopup from "./components/InvitePopup";

function App() {
  return (
    <>
      {/* <InvitePopup /> */}
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
      <div className="flex w-full h-screen">
        <Sidebar />
        <div className="flex flex-col w-full bg-[#292937]">
          <Header />
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default App;
