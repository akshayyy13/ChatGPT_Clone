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
}

export default function MessagesList({
  messages,
  editMsgId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onCopy,
}: MessagesListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex  flex-col flex-1 min-h-0 overflow-hidden">
      <div className="chatbar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable_both-edges]">
        <div className="mx-auto max-w-[40rem] lg:max-w-[48rem] px-5 pt-3 sm:p-0">
          {messages.map((m, i) => {
            const isEditing = editMsgId === m._id;
            return (
              <div key={m._id ?? i}>
                <MessageBubble
                  msg={m}
                  onEdit={
                    m.role === "user"
                      ? () => onStartEdit(m._id ?? null)
                      : undefined
                  }
                  isEditing={m.role === "user" ? isEditing : false}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={(next) => onSaveEdit(m._id as string, next)}
                  onCopy={() => {
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
