"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import useSWR, { mutate } from "swr";
import Hover from "@/components/Hover";
import { useThread } from "@/context/ThreadContext";

// Import all the smaller components
import SidebarHeader from "./components/SidebarHeader";
import SidebarNavigation from "./components/SidebarNavigation";
import SidebarThreadList from "./components/SidebarThreadList";
import SidebarProfile from "./components/SidebarProfile";

type ThreadListItem = { _id: string; preview: string };

const fetcher = async (url: string): Promise<{ threads: ThreadListItem[] }> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch threads");
  return res.json();
};

export default function CollapsibleSidebar({
  onCollapseChange,
  onNewChat,
}: {
  onCollapseChange?: (collapsed: boolean) => void;
  onNewChat?: () => void;
}) {
  const { sidebarKey } = useThread();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Use SWR with sidebarKey to trigger refetch when context changes
  const { data, isLoading } = useSWR<{ threads: ThreadListItem[] }>(
    `/api/threads?key=${sidebarKey}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
  );

  // Correctly parse /chat/[threadId]
  const currentId = useMemo(() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    return parts[0] === "chat" && parts[1] ? parts[1] : "";
  }, [pathname]);

  // Trigger SWR revalidation when sidebarKey changes (fixes sidebar update issue)
  useEffect(() => {
    mutate(`/api/threads?key=${sidebarKey}`);
  }, [sidebarKey]);

  // Handle redirect when no threads exist (FIXED - no more NEXT_REDIRECT error)
  useEffect(() => {
    if (
      !isLoading &&
      pathname === "/chat" &&
      data &&
      data.threads.length === 0
    ) {
      // Use window.location instead of router.replace to avoid NEXT_REDIRECT error
      window.location.href = "/chat/new";
    }
  }, [pathname, data, isLoading]);

  // Refresh the list when the window regains focus or becomes visible
  useEffect(() => {
    const onFocus = () => mutate(`/api/threads?key=${sidebarKey}`);
    const onVis = () => {
      if (document.visibilityState === "visible")
        mutate(`/api/threads?key=${sidebarKey}`);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [sidebarKey]);

  // Get user profile data
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

  // Notify parent of collapse state changes
  useEffect(() => {
    onCollapseChange?.(collapsed);
  }, [collapsed, onCollapseChange]);

  const widthCls = collapsed
    ? "w-[3.3rem] min-w-[3rem] justify-center"
    : "w-64 min-w-[16rem] justify-between bg-[var(--bg-elevated-secondary)]";
  const contentVis = collapsed
    ? "opacity-0 pointer-events-none"
    : "opacity-100";
  const headerContentVis = collapsed ? " hidden" : " flex px-2";

  return (
    <aside
      className={`text-[13px] font-normal relative border-r border-white/10 h-screen duration-200 ${widthCls} min-h-0 flex flex-col `}
    >
      <SidebarHeader collapsed={collapsed} setCollapsed={setCollapsed} />
      <SidebarNavigation
        collapsed={collapsed}
        headerContentVis={headerContentVis}
      />

      <SidebarThreadList
        data={data}
        isLoading={isLoading}
        currentId={currentId}
        contentVis={contentVis}
      />

      <SidebarProfile me={me} meLoading={meLoading} contentVis={contentVis} collapsed={collapsed} />
    </aside>
  );
}
