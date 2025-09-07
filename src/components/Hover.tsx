// components/Tooltip.tsx
"use client";
import React, { useState } from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  collapsed?: boolean; // optional flag
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  collapsed = true, // default: visible on hover if not passed
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const defaultClasses =
    "absolute top-full left-1/2 -translate-x-1/2 bg-black text-white text-[12px] px-2 py-[0.18rem] rounded-md shadow-lg whitespace-nowrap transition-opacity duration-200 pointer-events-none z-100";

  // Only show when allowed by 'collapsed' AND hovered
  const isVisible = collapsed && isHovered; // gate visibility with the prop [hover kept]

  const tooltipClasses = `${defaultClasses} ${marginTop ? marginTop : "mt-2"} ${
    marginBottom ? marginBottom : ""
  } ${marginLeft ? marginLeft : ""} ${marginRight ? marginRight : ""} ${
    isVisible ? "opacity-100" : "opacity-0"
  }`;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {collapsed && <div className={tooltipClasses}>{text}</div>}
    </div>
  );
};

export default Tooltip;
