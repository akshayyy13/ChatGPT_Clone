import Image from "next/image";
import { getInitials, getInitialsColor } from "@/utils/getInitials";

interface InitialsAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function InitialsAvatar({
  name,
  image,
  size = 24,
  className = "",
  fallbackIcon,
}: InitialsAvatarProps) {
  // If image exists (like Google profile photo), show it
  if (image) {
    return (
      <Image
        src={image}
        alt={name || "Profile"}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  // ✅ Extract ONLY initials (not full name)
  const initials = getInitials(name);

  // If we have initials, show them centered on colored background
  if (initials) {
    const bgColor = getInitialsColor(name);

    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
        }}
        className={`
          flex items-center justify-center 
          rounded-full 
          text-white 
          font-semibold 
          select-none 
          ${className}
        `}
      >
        {/* ✅ Show ONLY initials, centered, with responsive font size */}
        <span
          style={{
            fontSize: Math.max(size * 0.4, 10), // Responsive font size
            lineHeight: 1,
          }}
          className="uppercase tracking-tight"
        >
          {initials}
        </span>
      </div>
    );
  }

  // Fallback to provided icon (ChatGPT icon)
  if (fallbackIcon) {
    return <div className={className}>{fallbackIcon}</div>;
  }

  // Final fallback - generic user icon
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-full bg-gray-400 text-white font-semibold ${className}`}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}
