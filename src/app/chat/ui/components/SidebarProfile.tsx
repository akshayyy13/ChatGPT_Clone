"use client";
import chatgpt_icon from "../../../../asset/images/chatgpt_icon.png";
import InitialsAvatar from "@/components/InitialsAvatar"; // ✅ Import new component
import Image from "next/image";
interface SidebarProfileProps {
  me: { name?: string; image?: string } | undefined;
  meLoading: boolean;
  contentVis: string;
  collapsed: boolean;
}

export default function SidebarProfile({
  me,
  meLoading,
  contentVis,
  collapsed,
}: SidebarProfileProps) {
  return (
    <div className=" h-[60px]">
      <div
        className={`flex flex-row ${
          collapsed ? "mt-3 mx-1.5" : "ml-2 mr-3 p-2 "
        } rounded-xl items-center gap-2 hover:bg-[#f9f9f9]/10 cursor-pointer `}
      >
        {/* ✅ Use InitialsAvatar instead of Image */}
        <div className="px-2">
          <InitialsAvatar
            name={me?.name}
            image={me?.image}
            size={24}
            fallbackIcon={
              <Image
                src={chatgpt_icon.src}
                alt="ChatGPT"
                width={24}
                height={24}
                className="rounded-full"
              />
            }
          />
        </div>

        <div className={`flex flex-col ${contentVis}`}>
          <p className="truncate max-w-[10rem] font-extralight">
            {meLoading ? "Loading…" : me?.name || "User"}
          </p>
          <p className="text-white/60 text-[13px]">Free</p>
        </div>
      </div>
    </div>
  );
}
