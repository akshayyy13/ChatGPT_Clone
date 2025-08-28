"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "@/components/MessageBubble";
import { BsThreeDots, BsArrowRepeat } from "react-icons/bs";
import { IoIosArrowDown, IoMdArrowUp } from "react-icons/io";
import { RiVoiceprintLine, RiShare2Fill } from "react-icons/ri";
import { IoMicOutline, IoAddOutline } from "react-icons/io5";
import { Msg, TextContent } from "@/app/types";

export default function ChatView({
  threadId,
  model,
}: {
  threadId: string;
  model: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [editMsgId, setEditMsgId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function autosizeTextarea() {
    const el = taRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, 180);
      el.style.height = `${next}px`;
    });
  }

  useEffect(() => {
    autosizeTextarea();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const hasText = input.trim().length > 0;

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);

    let newMessages: Msg[] = [];
    if (editMsgId) {
      const idx = messages.findIndex((m) => m._id === editMsgId);
      if (idx !== -1) newMessages = messages.slice(0, idx);
      else newMessages = [...messages];
    } else {
      newMessages = [...messages];
    }

    const userMsg: Msg = { role: "user", content: [{ type: "text", text }] };
    newMessages.push(userMsg);
    setMessages(newMessages);
    setInput("");
    setEditMsgId(null);
    autosizeTextarea();

    try {
      const body: Record<string, any> = { message: text, model };
      if (editMsgId) body.editMsgId = editMsgId;

      const res = await fetch(`/api/chat?threadId=${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.body) {
        if (!res.ok) throw new Error("Failed to fetch AI response");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        const assistant: Msg = {
          role: "assistant",
          content: [{ type: "text", text: "" }],
        };

        // Append placeholder first
        setMessages((m) => [...newMessages, assistant]);

        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            acc += decoder.decode(value, { stream: true });
            setMessages((m) => [
              ...m.slice(0, -1),
              { role: "assistant", content: [{ type: "text", text: acc }] },
            ]);
          }
        }
      } else {
        setMessages((m) => [
          ...newMessages,
          {
            role: "assistant",
            content: [{ type: "text", text: `Mock reply: ${text}` }],
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...newMessages,
        {
          role: "assistant",
          content: [{ type: "text", text: `Mock reply: ${text}` }],
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/messages/${threadId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data?.messages)) setMessages(data.messages);
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [threadId]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <main className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="px-2 pt-2 flex justify-between">
        <button className="flex p-2 items-center rounded-lg hover:bg-white/10 gap-1.5">
          <p>ChatGPT</p> <IoIosArrowDown className="opacity-60" />
        </button>
        <div className="flex gap-2">
          <button className="px-4 flex items-center rounded-4xl hover:bg-white/10 gap-1.5">
            <RiShare2Fill className="opacity-80" /> <p>Share</p>
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10">
            <BsThreeDots />
          </button>
        </div>
      </div>
      <div className="w-full h-[0.5px] mt-2 bg-[#fff1]" />

      {/* Messages */}
      <div className="flex-1 w-full lg:w-9/12 m-auto overflow-y-auto sidebar-scroll p-4 sm:p-6 space-y-4">
        {messages.map((m, i) => (
          <MessageBubble
            key={m._id ?? i}
            msg={m}
            onEdit={
              m.role === "user"
                ? () => {
                    const text = (
                      m.content.find((c) => c.type === "text") as TextContent
                    )?.text;
                    if (text) {
                      setInput(text);
                      setEditMsgId(m._id ?? null);
                      setMessages((ms) => ms.filter((x) => x._id !== m._id));
                      setTimeout(() => {
                        taRef.current?.focus();
                        autosizeTextarea();
                      }, 0);
                    }
                  }
                : undefined
            }
            onCopy={() => {
              const text = (
                m.content.find((c) => c.type === "text") as TextContent
              )?.text;
              if (text) copyToClipboard(text);
            }}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="w-full lg:w-9/12 m-auto bg-[var(--bg-primary)]">
        <div
          className="w-full rounded-4xl mx-auto p-1.5 px-0 relative"
          style={{
            background: "var(--bg-elevated-primary)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
            minHeight: "56px",
          }}
        >
          <div className="flex items-end justify-between max-w-[1200px] mx-auto w-full">
            {/* Left */}
            <div className="px-2 hidden sm:flex items-end gap-2">
              <button
                className="cursor-pointer rounded-full hover:bg-[#454545] p-2"
                style={{ color: "var(--interactive-label-secondary-default)" }}
              >
                <IoAddOutline size={24} />
              </button>
            </div>

            {/* Textarea */}
            <div className="flex-1 justify-end">
              <textarea
                ref={taRef}
                className="w-full bg-transparent outline-none border-0 text-base sm:text-[15px] resize-none leading-6 placeholder:text-gray-400 placeholder:text-center sm:placeholder:text-left max-h-[180px] overflow-y-auto textarea-scroll"
                placeholder="Ask anything"
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autosizeTextarea();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                style={{ overflowAnchor: "none" }}
              />
            </div>

            {/* Right */}
            <div className="flex px-2 items-end gap-2">
              <div className="cursor-pointer rounded-full hover:bg-[#454545] p-2">
                <IoMicOutline size={20} />
              </div>
              {hasText ? (
                <button
                  onClick={send}
                  disabled={sending}
                  className="inline-flex items-center gap-2 p-2 rounded-full text-sm transition disabled:opacity-50"
                  style={{
                    background: "var(--interactive-bg-primary-default)",
                    color: "var(--interactive-label-primary-default)",
                  }}
                >
                  <IoMdArrowUp size={22} />
                </button>
              ) : (
                <div className="hidden sm:flex items-end gap-2">
                  <button
                    className="cursor-pointer rounded-full opacity-80 bg-[#454545] hover:opacity-70 p-2"
                    style={{
                      color: "var(--interactive-label-secondary-default)",
                    }}
                  >
                    <RiVoiceprintLine size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="my-2 w-full text-[11px] text-center text-[var(--text-tertiary)]">
          <div className="flex justify-center gap-1">
            <p>ChatGPT can make mistakes. Check important info. See </p>
            <Link href="/about" className="underline text-white opacity-85">
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
