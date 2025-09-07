// app/chat/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChatIndex() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log("Chat page - Session status:", status);
    console.log("Chat page - Session:", session);

    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      console.log("Not authenticated, redirecting to auth");
      router.push("/auth");
      return;
    }

    if (session?.user?.id && !isRedirecting) {
      setIsRedirecting(true);

      const handleChatRedirect = async () => {
        try {
          // Check for existing threads using your existing endpoint
          const response = await fetch("/api/threads", {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            const threads = data.threads || [];

            if (threads.length > 0) {
              // Redirect to most recent thread
              console.log(
                "Found existing thread, redirecting to:",
                threads[0]._id
              );
              router.push(`/chat/${threads[0]._id}`);
            } else {
              // Create new thread using your existing endpoint
              console.log("No threads found, creating new one");
              const createResponse = await fetch("/api/threads/new", {
                method: "POST",
                credentials: "include",
              });

              if (createResponse.ok) {
                const newThread = await createResponse.json();
                console.log(
                  "Created new thread, redirecting to:",
                  newThread.id
                );
                router.push(`/chat/${newThread.id}`);
              } else {
                console.error(
                  "Failed to create thread:",
                  createResponse.status
                );
              }
            }
          } else {
            console.error("Failed to fetch threads:", response.status);
            if (response.status === 401) {
              router.push("/auth");
            }
          }
        } catch (error) {
          console.error("Error handling chat redirect:", error);
          // Fallback - create new thread
          try {
            const createResponse = await fetch("/api/threads/new", {
              method: "POST",
              credentials: "include",
            });
            if (createResponse.ok) {
              const newThread = await createResponse.json();
              router.push(`/chat/${newThread.id}`);
            }
          } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
          }
        }
      };

      handleChatRedirect();
    }
  }, [session, status, router, isRedirecting]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Setting up your chat...</div>
      </div>
    );
  }

  // Fallback content if no redirect happens
  return (
    <div className="flex items-center justify-center h-screen">
      <div>Welcome to Chat!</div>
    </div>
  );
}
