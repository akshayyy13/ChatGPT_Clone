"use client";

import { useState, useEffect } from "react";

import type { Msg } from "@/app/types";
import TopBar from "./components/TopBar";
import MessagesList from "./components/MessagesList";
import Composer from "./components/Composer";
import { useThread } from "@/context/ThreadContext";
export default function ChatView({
  threadId,
  model,
  onThreadDeleted,
}: {
  threadId: string;
  model: string;
  onThreadDeleted?: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [editMsgId, setEditMsgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    url: string;
    mime: string;
    size?: number;
    publicId?: string;
    file?: File;
    googleFileUri?: string; // ✅ Add this
    googleFileName?: string; // ✅ Add this
    hasGoogleFile?: boolean; // ✅ Add this for status
    hasCloudinaryFile?: boolean; // ✅ Add this for status
  } | null>(null);

  const [uploading, setUploading] = useState(false);


  const startInlineEdit = (id: string | null) => setEditMsgId(id);
  const cancelInlineEdit = () => setEditMsgId(null);
  const { refreshSidebar } = useThread();
  async function handleDeleteThread() {
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete thread");

      // Refresh sidebar immediately
      refreshSidebar();

      // Use window.location instead of router.push to avoid NEXT_REDIRECT error
      window.location.href = "/chat";
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete thread.");
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("🔍 FRONTEND DEBUG - File selected:");
    console.log("- File name:", file.name);
    console.log("- File type:", file.type);
    console.log("- File size:", file.size);
    console.log("- Thread ID:", threadId); // ← Add this debug log

    // ✅ Show preview immediately
    const localUrl = URL.createObjectURL(file);
    setSelectedFile({
      name: file.name,
      url: localUrl,
      mime: file.type,
      size: file.size,
    });

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("threadId", threadId); // ← ADD THIS LINE
      formData.append("createMessage", "false");

      const res = await fetch("/api/chat/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // ✅ Update with permanent URL but NO DB message
      setSelectedFile({
        name: data.file.name,
        url: data.file.url,
        mime: data.file.mime,
        size: data.file.size,
        publicId: data.file.publicId,
      });

      URL.revokeObjectURL(localUrl);
      console.log("✅ File uploaded to Cloudinary (no DB):", data.file.name);
    } catch (err) {
      console.error(err);
      alert("File upload failed");
      setSelectedFile(null);
      URL.revokeObjectURL(localUrl);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function send() {
    const text = input.trim();
    if ((!text && !selectedFile) || sending) return;
    setSending(true);

    let newMessages: Msg[] = [...messages];
    const isNewChat = messages.length === 0;

    // Handle editing logic (keep existing)
    if (editMsgId) {
      const editIdx = messages.findIndex((m) => m._id === editMsgId);

      if (editIdx !== -1) {
        const messagesToKeep = messages.slice(0, editIdx);
        newMessages = [...messagesToKeep];

        try {
          await fetch(`/api/messages/deleteFromIndex`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              threadId,
              fromMessageId: editMsgId,
              inclusive: true,
            }),
          });
        } catch (err) {
          console.error("Failed to delete old messages from DB:", err);
          alert("Failed to delete old messages. Try again.");
          setSending(false);
          return;
        }
      }
    }

    // ✅ Create user message with text AND file
    const userMsg: Msg = {
      _id: `temp-${Date.now()}-${Math.random()}`,
      role: "user",
      content: [],
    };

    // Add text if provided
    if (text) {
      userMsg.content.push({ type: "text", text });
    }

    // ✅ Add pre-uploaded file if exists
    if (selectedFile) {
      userMsg.content.push({
        type: selectedFile.mime.startsWith("image/") ? "image" : "file",
        url: selectedFile.url, // Pre-uploaded Cloudinary URL
        mime: selectedFile.mime,
        name: selectedFile.name,
        size: selectedFile.size,
        publicId: selectedFile.publicId,
      });
    }

    // ✅ Show message in UI immediately
    newMessages.push(userMsg);
    setMessages(newMessages);

    // Store current file reference before clearing
    const currentFile = selectedFile;

    // Clear inputs
    setInput("");
    setSelectedFile(null); // ✅ Clear file from composer
    setEditMsgId(null);
    setIsLoading(true);
    try {
      // ✅ Send to chat API with file context
      // In your send function, when you have selectedFile
      const body = {
        message: text,
        model: "gemini-2.5-flash",
        ...(currentFile && {
          fileUrl: currentFile.url,
          fileName: currentFile.name,
          fileType: currentFile.mime,
          // ✅ NEW: Pass Google File URI to chat API
          googleFileUri: currentFile.googleFileUri,
          googleFileName: currentFile.googleFileName,
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
          _id: `temp-${Date.now() + 1}-${Math.random()}`,
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
            {
              ...assistant,
              role: "assistant",
              content: [{ type: "text", text: acc }],
            },
          ]);
        }

        if (isNewChat) {
          refreshSidebar();
        }
      }
    } catch (error) {
      console.error("Send failed:", error);
      setMessages((m) => [
        ...newMessages,
        {
          _id: `temp-${Date.now() + 2}-${Math.random()}`,
          role: "assistant",
          content: [
            { type: "text", text: `Mock reply: ${text || "File uploaded"}` },
          ],
        },
      ]);

      if (isNewChat) {
        refreshSidebar();
      }
    } finally {
      setSending(false);
      setIsLoading(false);
    }
  }

  async function saveInlineEdit(messageId: string, nextText: string) {
    const text = nextText.trim();
    if (sending || !text) return;

    setSending(true);
    
    const editIdx = messages.findIndex((m) => m._id === messageId);
    if (editIdx === -1) {
      setSending(false);
      setEditMsgId(null);
      return;
    }

    // ✅ GET ORIGINAL MESSAGE WITH FILE ATTACHMENTS
    const originalMessage = messages[editIdx];
    const originalFileContents = originalMessage.content.filter(
      (c) => c.type === "file"
    );

    const messagesToKeep = messages.slice(0, editIdx);
    try {
      await fetch(`/api/messages/deleteFromIndex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          fromMessageId: messageId,
          inclusive: true,
        }),
      });
    } catch (err) {
      console.error("Failed to delete old messages from DB:", err);
      alert("Failed to delete old messages. Try again.");
      setSending(false);
      return;
    }

    // ✅ CREATE MESSAGE WITH EDITED TEXT + ORIGINAL FILES
    const userMsg: Msg = {
      _id: `temp-${Date.now()}-${Math.random()}`, // Add temp ID for edit functionality
      role: "user",
      content: [
        { type: "text", text },
        ...originalFileContents, // ✅ PRESERVE FILE ATTACHMENTS
      ],
    };

    const base = [...messagesToKeep, userMsg];
    setMessages(base);
    setEditMsgId(null);

    try {
      const res = await fetch(`/api/chat?threadId=${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, model }),
      });
      if (!res.ok) throw new Error("Failed to fetch AI response");

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        const assistant: Msg = {
          _id: `temp-${Date.now()}-${Math.random()}`, // Add temp ID
          role: "assistant",
          content: [{ type: "text", text: "" }],
        };
        setMessages((m) => [...base, assistant]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((m) => [
            ...m.slice(0, -1),
            { ...assistant, content: [{ type: "text", text: acc }] },
          ]);
        }
      }
    } catch {
      setMessages((m) => [
        ...base,
        {
          _id: `temp-${Date.now()}-${Math.random()}`,
          role: "assistant",
          content: [{ type: "text", text: `Mock reply: ${text}` }],
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
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

  return (
    <main className="flex flex-col h-screen">
      <TopBar onDeleteThread={handleDeleteThread} />

      <MessagesList
        messages={messages}
        editMsgId={editMsgId}
        onStartEdit={startInlineEdit}
        onCancelEdit={cancelInlineEdit}
        onSaveEdit={saveInlineEdit}
        onCopy={copyToClipboard}
        isLoading={isLoading}
      />

      <Composer
        input={input}
        setInput={setInput}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        uploading={uploading}
        onSend={send}
        sending={sending}
        onFileSelect={handleFileSelect}
      />
    </main>
  );
}
