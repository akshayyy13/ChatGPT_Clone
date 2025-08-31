"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/MessageBubble";
import { BsThreeDots } from "react-icons/bs";
import { LuFlag } from "react-icons/lu";
import { IoIosArrowDown, IoMdArrowUp } from "react-icons/io";
import { RiVoiceprintLine, RiShare2Fill } from "react-icons/ri";
import { IoMicOutline, IoAddOutline } from "react-icons/io5";
import type { Msg, TextContent } from "@/app/types";
import { useRouter } from "next/navigation";
import { HiOutlineArchive } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    url: string;
    mime: string;
    size?: number;
    publicId?: string;
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number | null>(null);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDeleteThread() {
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        // ✅ fixed path
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete thread");

      router.push("/chat"); // or redirect to thread list
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete thread.");
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);
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
    if ((!text && !selectedFile) || sending) return; // Allow sending with just files
    setSending(true);

    let newMessages: Msg[] = [...messages];

    if (editMsgId) {
      const editIdx = messages.findIndex((m) => m._id === editMsgId);

      if (editIdx !== -1) {
        const messagesToKeep = messages.slice(0, editIdx);
        newMessages = [...messagesToKeep];

        try {
          await fetch(`/api/messages/deleteFromIndex`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ threadId, fromMessageId: editMsgId }),
          });
        } catch (err) {
          console.error("Failed to delete old messages from DB:", err);
          alert("Failed to delete old messages. Try again.");
          setSending(false);
          return;
        }
      }
    }

    // Add new message with file if present
    const userMsg: Msg = { role: "user", content: [] };
    if (text) userMsg.content.push({ type: "text", text });
    if (selectedFile) {
      userMsg.content.push({
        type: selectedFile.mime.startsWith("image/") ? "image" : "file",
        text: `File: ${selectedFile.name}`,
        name: selectedFile.name,
        url: selectedFile.url,
        mime: selectedFile.mime,
      });
    }

    newMessages.push(userMsg);
    setMessages(newMessages);
    setInput("");
    setSelectedFile(null);
    setEditMsgId(null);
    autosizeTextarea();

    // Send to AI with file data
    try {
      const body: Record<string, any> = {
        message: text,
        model: "gemini-2.0-flash", // Explicitly use 2.0
        ...(selectedFile && {
          fileUrl: selectedFile.url,
          fileName: selectedFile.name,
          fileType: selectedFile.mime,
        }),
      };

      const res = await fetch(`/api/chat?threadId=${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to fetch AI response");

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        const assistant: Msg = {
          role: "assistant",
          content: [{ type: "text", text: "" }],
        };

        setMessages((m) => [...newMessages, assistant]);

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
  // Update handleFileSelect to not include userId in formData
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("threadId", threadId);
      // Remove userId - let the server get it from session

      const res = await fetch("/api/chat/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const uploadedFile = data.message.content[0];
      setSelectedFile({
        name: uploadedFile.name,
        url: uploadedFile.url,
        mime: uploadedFile.mime,
      });

      console.log("File uploaded successfully:", uploadedFile);
    } catch (err) {
      console.error(err);
      alert("File upload failed");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <main className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="px-2 pt-2 flex justify-end sm:justify-between">
        <button className="hidden sm:flex cursor-pointer p-2 items-center rounded-lg hover:bg-white/10 gap-1.5">
          <p>ChatGPT</p> <IoIosArrowDown className="opacity-60" />
        </button>
        <div className="flex gap-2">
          <button className="px-4 flex cursor-pointer items-center rounded-4xl hover:bg-white/10 gap-1.5">
            <RiShare2Fill className="opacity-80" />{" "}
            <p className=" hidden sm:flex">Share</p>
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="px-2 py-3 cursor-pointer rounded-lg hover:bg-white/10"
            >
              <BsThreeDots />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-30 bg-[var(--bg-elevated-primary)] border border-[var(--border-default)] rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button
                    className="flex flex-row w-full text-left rounded-lg px-2 py-2 cursor-pointer hover:bg-white/10 items-center gap-1"
                    onClick={() => {
                      setMenuOpen(false);
                      // archive logic
                    }}
                  >
                    <HiOutlineArchive size={20} />
                    <p>Archive</p>
                  </button>

                  <button
                    className="flex flex-row w-full text-left rounded-lg px-2 py-2 cursor-pointer hover:bg-white/10 items-center gap-1"
                    onClick={() => {
                      setMenuOpen(false);
                      // report logic
                    }}
                  >
                    <LuFlag size={20} />
                    <p>Report</p>
                  </button>

                  <button
                    className="flex flex-row w-full text-left rounded-lg px-2 py-2 cursor-pointer text-[var(--interactive-icon-danger-secondary-hover)] hover:bg-[rgba(66,4,4,0.07)] gap-1"
                    onClick={async () => {
                      setMenuOpen(false);
                      await handleDeleteThread();
                    }}
                  >
                    <RiDeleteBin6Line size={20} />
                    <p>Delete</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full h-[0.5px] mt-2 bg-[#fff1]" />

      {/* Messages */}
      <div className="flex-1 w-full lg:w-9/12 m-auto overflow-y-auto sidebar-scroll p-4 sm:p-6 space-y-4">
        {messages.map((m, i) => {
          const isEditing = editMsgId === m._id;
          return (
            <div
              key={m._id ?? i}
              className={isEditing ? "opacity-60 relative" : ""}
            >
              {isEditing && (
                <span className="absolute -top-3 left-2 text-xs text-blue-500">
                  Editing...
                </span>
              )}
              <MessageBubble
                msg={m}
                onEdit={
                  m.role === "user"
                    ? () => {
                        const text = (
                          m.content.find(
                            (c) => c.type === "text"
                          ) as TextContent
                        )?.text;
                        if (text) {
                          setInput(text);
                          setEditMsgId(m._id ?? null);
                          // ❌ don’t remove the msg from state
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
            </div>
          );
        })}
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
            <div className="px-2 flex items-end gap-2">
              <button
                className="cursor-pointer rounded-full hover:bg-[#454545] p-2"
                style={{ color: "var(--interactive-label-secondary-default)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <IoAddOutline size={24} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.json,.csv"
                onChange={handleFileSelect}
              />
            </div>
            {/* File Preview (show when file is selected) */}
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 mr-2 bg-[var(--bg-background-primary)] rounded-lg border-1 border-[var(--border-heavy)] ">
                <span className="text-sm text-[var(--text-tertiary)]">
                  📎 {selectedFile.name}
                </span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-700 hover:text-red-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

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
                <div className="flex items-end gap-2">
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
        <div className="hidden sm:flex justify-center my-2 w-full text-[11px] text-center text-[var(--text-tertiary)]">
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
