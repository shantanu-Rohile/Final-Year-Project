// src/Layout.jsx
import React from "react";
import Sidebar from "./Components/Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <Sidebar />
      {/* Sidebar is fixed width: 70px */}
      <div className="ml-[70px]">
        <Outlet />
      </div>
    </div>
  );
}
