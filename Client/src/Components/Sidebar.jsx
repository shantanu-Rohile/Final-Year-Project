import React, { useState, useRef, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Radio,
  BarChart2,
  StickyNote,
  UserCheck,
  BadgeInfo,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [active, setActive] = useState("home");
  const sidebarRef = useRef(null);
  const linkRefs = useRef({});
  const [indicatorPos, setIndicatorPos] = useState({ top: 0 });
  const navigate = useNavigate();

  // Update the purple indicator position when active item changes
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
  const SidebarLink = forwardRef(({ IconComponent, label, id, isActive }, ref) => {
    return (
      <div
        // to={to}
        ref={ref}
        onClick={() => setActive(id)}
        className={`relative flex flex-col items-center justify-center pt-2.5 pb-2 group cursor-pointer hover:bg-ter rounded-lg transition-colors`}
      >
        <IconComponent
          className={`size-5 2xl:size-6 transition-colors duration-300 ${
            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
          }`}
        />
        <span className="text-xs text-gray-400 group-hover:text-white">
          {label}
        </span>
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
        {/* Logo */}
        <div className="hover:bg-ter rounded-lg transition-opacity duration-300">
          <img
            src="./logo.png"
            alt="Logo"
            className={`w-full m-auto object-contain p-4 logo-filter opacity-90`}
          />
        </div>

        {/* Menu Items */}
        <div className="space-y-2.5 2xl:space-y-4 mt-1 2xl:mt-2">
          <SidebarLink
            id="home"
            IconComponent={Home}
            label="Home"
            isActive={active === "home"}
            ref={(el) => (linkRefs.current["home"] = el)}
          />
          <SidebarLink
            id="session"
            IconComponent={Radio}
            label="Session"
            isActive={active === "session"}
            ref={(el) => (linkRefs.current["session"] = el)}
          />
          <SidebarLink
            id="stats"
            IconComponent={BarChart2}
            label="Stats"
            isActive={active === "stats"}
            ref={(el) => (linkRefs.current["stats"] = el)}
          />
          <SidebarLink
            id="notes"
            IconComponent={StickyNote}
            label="Notes"
            isActive={active === "notes"}
            ref={(el) => (linkRefs.current["notes"] = el)}
          />
          <SidebarLink
            id="attendance"
            IconComponent={UserCheck}
            label="Attendance"
            isActive={active === "attendance"}
            ref={(el) => (linkRefs.current["attendance"] = el)}
          />
          <hr className="border-[var(--txt-disabled)] opacity-50 md:my-2.5 2xl:my-4 mx-4" />
          <SidebarLink
            id="about"
            IconComponent={BadgeInfo}
            label="About"
            isActive={active === "about"}
            ref={(el) => (linkRefs.current["about"] = el)}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-2 w-full mb-4">
        <SidebarLink
          id="settings"
          IconComponent={Settings}
          label="Settings"
          isActive={active === "settings"}
          ref={(el) => (linkRefs.current["settings"] = el)}
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
