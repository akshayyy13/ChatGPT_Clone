"use client";
import React, { useState, useEffect } from "react";
import CollapsibleSidebar from "./ui/CollapsibleSidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isMobile || collapsed) return;

    const handleClick = (e: MouseEvent) => {
      const sidebar = document.querySelector("aside");
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setCollapsed(true);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isMobile, collapsed]);

  return (
    <div className="h-screen flex flex-row">
      <CollapsibleSidebar onCollapseChange={setCollapsed} />
      <div
        className={`min-h-0 w-full ${
          isMobile && !collapsed ? "hidden" : "block"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
