"use client";
import React, { useState, useEffect } from "react";
import CollapsibleSidebar from "./ui/CollapsibleSidebar";
import Image from "next/image";

import sidebar from "../../asset/images/sidebar.png";
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
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
    <div className="h-screen flex flex-row relative">
      {isMobile && collapsed && (
        <div className=" absolute p-3 cursor-pointer  rounded-lg hover:bg-white/10 ">
          <Image
            src={sidebar}
            alt="sidebar Icon"
            width={20} // adjust size
            height={20}
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-full invert opacity-80" // Tailwind: makes it circular
          />
        </div>
      )}
      {(!isMobile || !collapsed) && (
        <CollapsibleSidebar onCollapseChange={setCollapsed} />
      )}
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
