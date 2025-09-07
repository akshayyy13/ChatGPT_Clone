"use client";
import React, { useState, useEffect } from "react";
import CollapsibleSidebar from "./ui/CollapsibleSidebar";
import { ThreadProvider } from "@/context/ThreadContext";
import { useRouter } from "next/navigation";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // ✅ ADD THIS: Handle new chat
  const handleNewChat = () => {
    router.push("/chat");
  };

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
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
    <ThreadProvider>
      <div className="h-screen flex flex-row relative overflow-hidden">
        {isMobile && collapsed && (
          <div className="absolute top-1.5 p-2 cursor-pointer rounded-lg">
            <svg
              width="25"
              height="25"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              data-rtl-flip=""
              onClick={() => setCollapsed((v) => !v)}
              className="icon-lg text-token-text-secondary mx-2 transition-all duration-200"
            >
              <path d="M11.6663 12.6686L11.801 12.6823C12.1038 12.7445 12.3313 13.0125 12.3313 13.3337C12.3311 13.6547 12.1038 13.9229 11.801 13.985L11.6663 13.9987H3.33325C2.96609 13.9987 2.66839 13.7008 2.66821 13.3337C2.66821 12.9664 2.96598 12.6686 3.33325 12.6686H11.6663ZM16.6663 6.00163L16.801 6.0153C17.1038 6.07747 17.3313 6.34546 17.3313 6.66667C17.3313 6.98788 17.1038 7.25586 16.801 7.31803L16.6663 7.33171H3.33325C2.96598 7.33171 2.66821 7.03394 2.66821 6.66667C2.66821 6.2994 2.96598 6.00163 3.33325 6.00163H16.6663Z"></path>
            </svg>
          </div>
        )}
        {(!isMobile || !collapsed) && (
          <div className=" ">
            <CollapsibleSidebar
              onCollapseChange={setCollapsed}
              onNewChat={handleNewChat} // ✅ ADD THIS LINE
            />
          </div>
        )}
        <div
          className={`min-h-0 w-full ${
            isMobile && !collapsed
              ? "fixed -z-2 after:absolute after:inset-0 after:bg-[#00000080] after:bg-blend-multiply"
              : "block"
          }`}
        >
          {children}
        </div>
      </div>
    </ThreadProvider>
  );
}
