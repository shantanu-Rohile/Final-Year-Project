// src/NoSidebarLayout.jsx
import { Outlet } from "react-router-dom";

export default function NoSidebarLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
