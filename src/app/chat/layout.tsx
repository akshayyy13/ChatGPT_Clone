import React from "react";
import CollapsibleSidebar from "./ui/CollapsibleSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-row">
      <CollapsibleSidebar />
      <div className="min-h-0 w-full">{children}</div>
    </div>
  );
}
