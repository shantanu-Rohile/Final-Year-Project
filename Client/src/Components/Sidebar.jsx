import React, { useState } from "react";

const Sidebar = () => {
  const [active, setActive] = useState("home");

  const menuItems = [
    { id: "home", icon: "fa-home", label: "Home" },
    { id: "session", icon: "fa-video", label: "Session" },
    { id: "stats", icon: "fa-chart-bar", label: "Stats" },
    { id: "notes", icon: "fa-sticky-note", label: "Notes" },
    { id: "attendance", icon: "fa-user-check", label: "Attendance" },
    { id: "about", icon: "fa-info-circle", label: "About" },
    { id: "settings", icon: "fa-cog", label: "Settings" },
  ];

  return (
    <div className="h-screen w-20 bg-[#0E1420] items-center py-6 space-y-6">
      {/* Logo */}
      <div className="">
        <img
          src="/logo.png"
          alt="logo"
          className="w-10 h-10 rounded-lg cursor-pointer"
        />
      </div>

      {/* Menu Items */}
      <div className="flex flex-col space-y-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`relative flex flex-col items-center group cursor-pointer transition-all duration-300 ${
              active === item.id ? "text-white" : "text-gray-400"
            }`}
            // onClick={() => setActive(item.id)}
          >
            {/* Active indicator bar */}
            {/* {active === item.id && (
              <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-full"></span>
            )} */}

            {/* Icon */}
            <i
              className={`fas ${item.icon} text-xl mb-1 group-hover:text-white transition-colors duration-300`}
            ></i>

            {/* Label */}
            <span className="text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
