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
    "/dashboard": "home",
    "/session": "session",
    "/aboutus": "about",
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

  // Update indicator position when active changes
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

  // Sidebar Link component
  const SidebarLink = forwardRef(({ IconComponent, label, id, onClick }, ref) => {
    const isActive = active === id;
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center pt-2.5 pb-2 group cursor-pointer 
          hover:bg-[var(--bg-ter)] rounded-[var(--radius)] transition-colors`}
      >
        <IconComponent
          className={`size-5 2xl:size-6 transition-colors duration-300 
            ${
              isActive
                ? "text-[var(--txt)]"
                : "text-[var(--txt-dim)] group-hover:text-[var(--txt)]"
            }`}
        />
        <span className="text-xs text-[var(--txt-dim)] group-hover:text-[var(--txt)]">
          {label}
        </span>
      </div>
    );
  });
  SidebarLink.displayName = "SidebarLink";

  return (
    <nav
      ref={sidebarRef}
      className="w-[70px] border-r border-[color:rgba(var(--shadow-rgb),0.2)] 
        p-1 flex flex-col items-center justify-between fixed top-0 left-0 h-screen 
        bg-[var(--bg-sec)] transition-colors duration-300"
    >
      {/* Top Section */}
      <div>
        <div className="hover:bg-[var(--bg-ter)] rounded-[var(--radius)] transition-opacity duration-300">
          <img
            src={Logo}
            alt="Logo"
            className="w-32 mx-auto p-1 my-4 object-contain logo-filter opacity-100"
            style={{ filter: "invert(var(--logo-invert, 0))" }}
          />
        </div>

        <div className="space-y-2.5 2xl:space-y-4 mt-1 2xl:mt-2">
          <SidebarLink
            id="home"
            IconComponent={Home}
            label="Home"
            ref={(el) => (linkRefs.current["home"] = el)}
            onClick={() => navigate("/dashboard")}
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
            onClick={() => navigate("/aboutus")}
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

      {/* Active Indicator */}
      <motion.span
        className="absolute left-1 h-8 w-1 rounded-full bg-[var(--btn)] shadow-[0_0_10px_rgba(var(--shadow-rgb),0.6)]"
        animate={{ top: indicatorPos.top }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </nav>
  );
}

export default Sidebar;
