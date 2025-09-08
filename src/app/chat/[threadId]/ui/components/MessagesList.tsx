// src / app / chat / [threadId] / ui / components / MessagesList.tsx;
"use client";

import { useRef, useEffect } from "react";
import MessageBubble from "@/components/MessageBubble";
import type { Msg, TextContent } from "@/app/types";

interface MessagesListProps {
  messages: Msg[];
  editMsgId: string | null;
  onStartEdit: (id: string | null) => void;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string, nextText: string) => Promise<void>;
  onCopy: (text: string) => void;
  isLoading?:boolean;
}

export default function MessagesList({
  messages,
  editMsgId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onCopy,
  isLoading=false,
}: MessagesListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Create loading message when needed
  const loadingMessage = {
    _id: "loading",
    role: "assistant" as const,
    content: [],
    isLoading: true,
  };

  // ✅ Combine messages with loading message if needed
  const allMessages = isLoading ? [...messages, loadingMessage] : messages;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="chatbar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable_both-edges]">
        <div className="mx-auto max-w-[40rem] lg:max-w-[48rem] px-5 pt-3 sm:p-0">
          {allMessages.map((m, i) => {
            // ✅ Use allMessages instead of messages
            const isEditing = editMsgId === m._id;
            return (
              <div key={m._id ?? i}>
                <MessageBubble
                  msg={m}
                  onEdit={
                    m.role === "user" && !("isLoading" in m) // ✅ Don't allow editing loading messages
                      ? () => onStartEdit(m._id ?? null)
                      : undefined
                  }
                  isEditing={m.role === "user" ? isEditing : false}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={(next) => onSaveEdit(m._id as string, next)}
                  onCopy={() => {
                    if ("isLoading" in m) return; // ✅ Don't allow copying loading messages
                    const text = (
                      m.content.find((c) => c.type === "text") as TextContent
                    )?.text;
                    if (text) onCopy(text);
                  }}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}