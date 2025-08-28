"use client";
import Image from "next/image";
import Link from "next/link";
import { FiEdit } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { MdOutlineCollections } from "react-icons/md";
import { LuSearch } from "react-icons/lu";
import chatgpt_icon from "../../../asset/images/chatgpt_icon.png";
import sidebar from "../../../asset/images/sidebar.png";
type ThreadListItem = { _id: string; preview: string };

const fetcher = async (url: string): Promise<{ threads: ThreadListItem[] }> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch threads");
  return res.json();
};

export default function CollapsibleSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data, isLoading } = useSWR<{ threads: ThreadListItem[] }>(
    "/api/threads",
    fetcher
  );

  const [collapsed, setCollapsed] = useState(false);

  // Correctly parse /chat/[threadId]
  const currentId = useMemo(() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean); // e.g., ["chat","<id>"]
    return parts[0] === "chat" && parts[1] ? parts[1] : "";
  }, [pathname]);

  // If on /chat and no threads, redirect to /chat/new
  useEffect(() => {
    if (pathname === "/chat" && data && data.threads.length === 0) {
      router.replace("/chat/new");
    }
  }, [pathname, data, router]);

  // Refresh the list when the window regains focus or becomes visible
  useEffect(() => {
    const onFocus = () => mutate("/api/threads");
    const onVis = () => {
      if (document.visibilityState === "visible") mutate("/api/threads");
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const widthCls = collapsed
    ? "w-12 min-w-[3rem] justify-center"
    : "w-64 min-w-[16rem] justify-between";
  const contentVis = collapsed
    ? "opacity-0 pointer-events-none"
    : "opacity-100";
  // .
  const {
    data: me,
    isLoading: meLoading,
    error: meError,
  } = useSWR<{ name?: string; image?: string }, Error>(
    "/api/me",
    (url: string) =>
      fetch(url, { cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json() as Promise<{ name?: string; image?: string }>;
      })
  );

  return (
    <aside
      className={`relative border-r border-white/10 bg-[var(--bg-elevated-secondary)] transition-[width] duration-200 ${widthCls} h-screen min-h-0 flex flex-col`}
    >
      <div
        className={`flex flex-row ${
          collapsed ? "justify-center" : "justify-between"
        } pr-5 pl-2 h-14 items-center`}
      >
        <div className="p-2 rounded-lg hover:bg-white/10 cursor-pointer ">
          <Image
            src={chatgpt_icon}
            alt="ChatGPT Icon"
            width={26} // adjust size
            height={26}
            // onClick={}
            className="" // Tailwind: makes it circular
          />
        </div>
        {/* Collapse/expand button */}
        <div
          className={`text-white p-2 flex items-center gap-2 
          }`}
        >
          <div
            className={`p-2 rounded-lg hover:bg-white/10 ${
              collapsed ? "cursor-e-resize" : "cursor-w-resize"
            }`}
          >
            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
              className={`z-10 inline-flex items-center  w-6 h-6 ${
                collapsed ? "cursor-e-resize" : "cursor-w-resize"
              }`}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <Image
                src={sidebar}
                alt="sidebar Icon"
                width={20} // adjust size
                height={20}
                className="rounded-full invert opacity-80" // Tailwind: makes it circular
              />
            </button>
          </div>
        </div>
      </div>
      {/* Header */}
      <div
        className={`ml-2 mr-5 flex flex-col pt-4 transition-opacity duration-150 `}
      >
        <div>
          <Link
            href="/chat/new"
            prefetch={false}
            className="w-full flex items-center px-3 py-2 flex-row rounded-lg hover:bg-white/10 text-white/90"
          >
            <div>
              <FiEdit />
            </div>
            <div>
              <p className={`px-2 ${contentVis}`}>New chat</p>
            </div>
          </Link>
        </div>
        <div>
          <Link
            href="/chat/search"
            prefetch={false}
            className="w-full flex items-center px-3 py-2 flex-row rounded-lg hover:bg-white/10 text-white/90"
          >
            <div>
              <LuSearch />
            </div>
            <div>
              <p className={`px-2 ${contentVis}`}>Search chats</p>
            </div>
          </Link>
        </div>
        <div>
          <Link
            href="/chat/library"
            prefetch={false}
            className="w-full flex items-center px-3 py-2 flex-row rounded-lg hover:bg-white/10 text-white/90"
          >
            <div>
              <MdOutlineCollections />
            </div>
            <div>
              <p className={`px-2 ${contentVis}`}>Library</p>
            </div>
          </Link>
        </div>
        <div className="w-full h-[1px] mt-2 bg-[#fff1]"></div>
      </div>

      {/* Scrollable list area */}
      <div
        className={`mt-3 sidebar-scroll flex-1 min-h-0 overflow-y-auto pb-3 transition-opacity duration-150 ${contentVis}`}
      >
        <div className=" ml-2 mr-3">
          <Link
            href="/chat/sora"
            prefetch={false}
            className="w-full flex px-3 py-2  flex-row rounded-lg hover:bg-white/10 text-white/90"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              aria-hidden="true"
            >
              <path d="M16.585 10C16.585 6.3632 13.6368 3.41504 10 3.41504C6.3632 3.41504 3.41504 6.3632 3.41504 10C3.41504 13.6368 6.3632 16.585 10 16.585C13.6368 16.585 16.585 13.6368 16.585 10ZM17.915 10C17.915 14.3713 14.3713 17.915 10 17.915C5.62867 17.915 2.08496 14.3713 2.08496 10C2.08496 5.62867 5.62867 2.08496 10 2.08496C14.3713 2.08496 17.915 5.62867 17.915 10Z"></path>
              <path d="M7.96545 12.1812V7.81878C7.96545 7.17205 8.68092 6.78144 9.22494 7.13117L12.6179 9.31238C13.1185 9.63416 13.1185 10.3658 12.6179 10.6876L9.22494 12.8688C8.68092 13.2186 7.96545 12.828 7.96545 12.1812Z"></path>
            </svg>
            <p className=" px-2">Sora</p>
          </Link>
        </div>
        <div className=" ml-2 mr-3 ">
          <Link
            href="/chat/GPTs"
            prefetch={false}
            className="w-full flex px-3 py-2  flex-row rounded-lg hover:bg-white/10 text-white/90"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              aria-hidden="true"
            >
              <path d="M7.94556 14.0277C7.9455 12.9376 7.06204 12.054 5.97192 12.054C4.88191 12.0542 3.99835 12.9376 3.99829 14.0277C3.99829 15.1177 4.88188 16.0012 5.97192 16.0013C7.06207 16.0013 7.94556 15.1178 7.94556 14.0277ZM16.0012 14.0277C16.0012 12.9376 15.1177 12.054 14.0276 12.054C12.9375 12.0541 12.054 12.9376 12.054 14.0277C12.054 15.1178 12.9375 16.0012 14.0276 16.0013C15.1177 16.0013 16.0012 15.1178 16.0012 14.0277ZM7.94556 5.97201C7.94544 4.88196 7.062 3.99837 5.97192 3.99837C4.88195 3.99849 3.99841 4.88203 3.99829 5.97201C3.99829 7.06208 4.88187 7.94552 5.97192 7.94564C7.06207 7.94564 7.94556 7.06216 7.94556 5.97201ZM16.0012 5.97201C16.0011 4.88196 15.1177 3.99837 14.0276 3.99837C12.9376 3.99843 12.0541 4.882 12.054 5.97201C12.054 7.06212 12.9375 7.94558 14.0276 7.94564C15.1177 7.94564 16.0012 7.06216 16.0012 5.97201ZM9.27563 14.0277C9.27563 15.8524 7.79661 17.3314 5.97192 17.3314C4.14734 17.3313 2.66821 15.8523 2.66821 14.0277C2.66827 12.2031 4.14737 10.7241 5.97192 10.724C7.79657 10.724 9.27558 12.203 9.27563 14.0277ZM17.3313 14.0277C17.3313 15.8524 15.8523 17.3314 14.0276 17.3314C12.203 17.3313 10.7239 15.8523 10.7239 14.0277C10.7239 12.2031 12.203 10.724 14.0276 10.724C15.8522 10.724 17.3312 12.203 17.3313 14.0277ZM9.27563 5.97201C9.27563 7.7967 7.79661 9.27572 5.97192 9.27572C4.14734 9.2756 2.66821 7.79662 2.66821 5.97201C2.66833 4.14749 4.14741 2.66841 5.97192 2.6683C7.79654 2.6683 9.27552 4.14742 9.27563 5.97201ZM17.3313 5.97201C17.3313 7.79669 15.8523 9.27572 14.0276 9.27572C12.203 9.27566 10.7239 7.79666 10.7239 5.97201C10.724 4.14746 12.203 2.66836 14.0276 2.6683C15.8522 2.6683 17.3312 4.14742 17.3313 5.97201Z"></path>
            </svg>
            <p className=" px-2">GPTs</p>
          </Link>
        </div>

        <div className=" px-3 ml-2 mr-3 mt-5 text-sm text-white/70 mb-2">
          Chats
        </div>
        {isLoading ? (
          <div className="text-xs text-white/50 px-2 py-1.5">Loading…</div>
        ) : data?.threads?.length ? (
          <nav className="space-y-1">
            {data.threads.map((t) => (
              <Link
                key={t._id}
                href={`/chat/${t._id}`}
                prefetch={false}
                className={`block ml-2 mr-3 px-3 py-1.5 rounded-lg truncate ${
                  t._id === currentId
                    ? "bg-white/5 text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
                title={t.preview}
              >
                {t.preview}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="text-xs px-3 text-white/50  py-1.5">No chats yet</div>
        )}
      </div>

      {/* Profile */}
      <div className="h-16">
        <div className="w-full h-[1px] mt-2 bg-[#fff1]" />
        <div className={`flex flex-row items-center gap-2 px-3 cursor-pointer `}>
          <Image
            src={meLoading || !me?.image ? chatgpt_icon : me.image}
            alt={me?.name || "Profile"}
            width={26}
            height={26}
            className="rounded-full"
          />
          <div className={`flex flex-col ${contentVis}`}>
            <p className="truncate max-w-[10rem]">
              {meLoading ? "Loading…" : me?.name || "User"}
            </p>
            <p className="text-white/60">Free</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
