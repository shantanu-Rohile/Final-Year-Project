// pages/Settings.jsx
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Palette, User, LogOut } from "lucide-react";
import Themes from "../Components/Settings/Themes";
import Account from "../Components/Settings/Account";

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "themes";

  // ✅ Sidebar toggle for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar menu items
  const menuItems = [
    { id: "account", label: "Account", icon: User },
    { id: "themes", label: "Themes", icon: Palette },
  ];

  // Handle tab change
  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row h-screen ml-[70px]"
      style={{ backgroundColor: "var(--bg-sec)" }}
    >
      {/* ✅ Mobile Header */}
      <div
        className="flex items-center justify-between p-4 border-b md:hidden"
        style={{
          borderColor: "var(--bg-ter)",
          backgroundColor: "var(--bg-sec)",
        }}
      >
        <h1 className="text-xl font-bold" style={{ color: "var(--txt)" }}>
          Settings
        </h1>
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{
            backgroundColor: "var(--bg-ter)",
            color: "var(--txt)",
          }}
          aria-label="Toggle menu"
        >
          <i className="ri-menu-line text-xl" />
        </button>
      </div>

      {/* ✅ Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-60 p-6 border-r z-20
          ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--bg-ter)",
        }}
      >
        {/* Close button on mobile */}
        <h1
          className="px-4 text-2xl font-bold pb-2"
          style={{ color: "var(--txt)" }}
        >
          Settings
        </h1>
        <hr className="border-[var(--txt-disabled)] opacity-50 pb-4" />
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: "var(--bg-ter)",
              color: "var(--txt)",
            }}
            aria-label="Close menu"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  handleTabChange(item.id);
                  setIsSidebarOpen(false); // auto-close on mobile
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive ? "font-semibold" : ""
                }`}
                style={{
                  backgroundColor: isActive ? "var(--btn)" : "transparent",
                  color: isActive ? "#fff" : "var(--txt)",
                }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: isActive
                    ? "var(--btn-hover)"
                    : "var(--bg-ter)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-base md:text-lg">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-md
                       bg-[var(--bg-ter)] text-[var(--txt)]
                       hover:bg-[var(--bg-sec)] transition"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>

      {/* ✅ Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentTab === "themes" && <Themes />}
          {currentTab === "account" && <Account />}
        </motion.div>
      </div>

      {/* ✅ Mobile Overlay (when sidebar open) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Settings;
