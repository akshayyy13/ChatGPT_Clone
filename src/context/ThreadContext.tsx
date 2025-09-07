"use client";
import React, { createContext, useContext, useState } from "react";

interface ThreadContextType {
  refreshSidebar: () => void;
  sidebarKey: number;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const [sidebarKey, setSidebarKey] = useState(0);

  const refreshSidebar = () => {
    setSidebarKey((prev) => prev + 1);
  };

  return (
    <ThreadContext.Provider value={{ refreshSidebar, sidebarKey }}>
      {children}
    </ThreadContext.Provider>
  );
}

export function useThread() {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error("useThread must be used within ThreadProvider");
  }
  return context;
}
