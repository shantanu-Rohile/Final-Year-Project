// pages/Settings.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Palette, User } from "lucide-react";
import Themes from "../Components/Settings/Themes";
import Account from "../Components/Settings/Account";

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "themes";

  // Sidebar menu items
  const menuItems = [
    { id: "account", label: "Account", icon: User },
    { id: "themes", label: "Themes", icon: Palette },
  ];

  // Handle tab change
  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div
      className="min-h-screen flex h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Settings Sidebar */}
      <div
        className="w-64 md:w-72 ml-[70px] p-6 border-r"
        style={{
          backgroundColor: "var(--bg-sec)",
          borderColor: "var(--bg-ter)",
        }}
      >
        <h1
          className="text-2xl md:text-3xl font-bold mb-8"
          style={{ color: "var(--txt)" }}
        >
          Settings
        </h1>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive ? "font-semibold" : ""
                }`}
                style={{
                  backgroundColor: isActive ? "var(--btn)" : "transparent",
                  color: isActive ? "white" : "var(--txt)",
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-8 lg:p-8 overflow-y-auto">
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
    </div>
  );
};

export default Settings;
