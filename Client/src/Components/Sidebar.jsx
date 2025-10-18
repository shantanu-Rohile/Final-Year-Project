// src/components/Sidebar.jsx
import React, { useState, useRef, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";
import {
  Home,
  Radio,
  BarChart2,
  StickyNote,
  UserCheck,
  BadgeInfo,
  Settings,
} from "lucide-react";

function Sidebar() {
  const [active, setActive] = useState("home");
  const sidebarRef = useRef(null);
  const linkRefs = useRef({});
  const [indicatorPos, setIndicatorPos] = useState({ top: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  // Map URL paths to sidebar IDs
  const pathToId = {
    "/": "home",
    "/session": "session",
    "/Page": "about",
    "/stats": "stats",
    "/notes": "notes",
    "/attendance": "attendance",
    "/settings": "settings",
  };

  // Sync active state with URL
  useEffect(() => {
    const currentId = pathToId[location.pathname];
    if (currentId) setActive(currentId);
  }, [location]);

  // Update the purple indicator position when active changes
  useEffect(() => {
    const activeLink = linkRefs.current[active];
    if (sidebarRef.current && activeLink) {
      const containerRect = sidebarRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const indicatorHeight = 32;
      const top =
        linkRect.top -
        containerRect.top +
        linkRect.height / 2 -
        indicatorHeight / 2;
      setIndicatorPos({ top });
    }
  }, [active]);

  // Single Sidebar Item
  const SidebarLink = forwardRef(({ IconComponent, label, id, onClick }, ref) => {
    const isActive = active === id;
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center pt-2.5 pb-2 group cursor-pointer hover:bg-ter rounded-lg transition-colors`}
      >
        <IconComponent
          className={`size-5 2xl:size-6 transition-colors duration-300 ${
            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
          }`}
        />
        <span className="text-xs text-gray-400 group-hover:text-white">{label}</span>
      </div>
    );
  });
  SidebarLink.displayName = "SidebarLink";

  return (
    <nav
      ref={sidebarRef}
      className="w-[70px] border-r border-gray-500/20 p-1 flex flex-col items-center justify-between fixed top-0 left-0 h-screen bg-[#0E1420]"
    >
      {/* Top Section */}
      <div>
        <div className="hover:bg-ter rounded-lg transition-opacity duration-300">
          <img
            src={Logo}
            alt="Logo"
            className="w-32 mx-auto p-1 my-4 object-contain logo-filter opacity-100"
          />
        </div>

        <div className="space-y-2.5 2xl:space-y-4 mt-1 2xl:mt-2">
          <SidebarLink
            id="home"
            IconComponent={Home}
            label="Home"
            ref={(el) => (linkRefs.current["home"] = el)}
            onClick={() => navigate("/")}
          />
          <SidebarLink
            id="session"
            IconComponent={Radio}
            label="Session"
            ref={(el) => (linkRefs.current["session"] = el)}
            onClick={() => navigate("/session")}
          />
          <SidebarLink
            id="stats"
            IconComponent={BarChart2}
            label="Stats"
            ref={(el) => (linkRefs.current["stats"] = el)}
            onClick={() => navigate("/stats")}
          />
          <SidebarLink
            id="notes"
            IconComponent={StickyNote}
            label="Notes"
            ref={(el) => (linkRefs.current["notes"] = el)}
            onClick={() => navigate("/notes")}
          />
          <SidebarLink
            id="attendance"
            IconComponent={UserCheck}
            label="Attendance"
            ref={(el) => (linkRefs.current["attendance"] = el)}
            onClick={() => navigate("/attendance")}
          />
          <hr className="border-[var(--txt-disabled)] opacity-50 md:my-2.5 2xl:my-4 mx-4" />
          <SidebarLink
            id="about"
            IconComponent={BadgeInfo}
            label="About"
            ref={(el) => (linkRefs.current["about"] = el)}
            onClick={() => navigate("/Page")}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-2 w-full mb-4">
        <SidebarLink
          id="settings"
          IconComponent={Settings}
          label="Settings"
          ref={(el) => (linkRefs.current["settings"] = el)}
          onClick={() => navigate("/settings")}
        />
      </div>

      {/* Purple Active Indicator */}
      <motion.span
        className="absolute left-1 h-8 w-1 rounded-full bg-purple-500"
        animate={{ top: indicatorPos.top }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </nav>
  );
}

export default Sidebar;
