"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Turn = { role: "user" | "assistant"; content: string };

export default function GuestChat() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [remaining, setRemaining] = useState(2);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedTurns = sessionStorage.getItem("guest-chat-turns");
      if (savedTurns) {
        const parsed = JSON.parse(savedTurns) as Turn[];
        const valid = Array.isArray(parsed) && parsed.every(
          (turn) => turn && ["user", "assistant"].includes(turn.role) && typeof turn.content === "string"
        );
        if (valid) {
          setTurns(parsed);
          const answered = parsed.filter((turn) => turn.role === "assistant").length;
          setRemaining(Math.max(0, 2 - answered));
          if (answered >= 2) setShowSignup(true);
        } else {
          sessionStorage.removeItem("guest-chat-turns");
        }
      }
    } catch {
      try {
        sessionStorage.removeItem("guest-chat-turns");
      } catch {
        // Chat remains usable when browser storage is blocked.
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem("guest-chat-turns", JSON.stringify(turns));
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [ready, turns]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading || !ready || remaining <= 0) return;

    const nextTurns: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(nextTurns);
    setInput("");
    setError("");
    setLoading(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch("/api/chat/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextTurns }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Could not get a response. Please try again.");

      const completedTurns = [...nextTurns, { role: "assistant" as const, content: data.reply }];
      setTurns(completedTurns);
      setRemaining(data.remaining);
      if (data.remaining === 0) setShowSignup(true);
    } catch (sendError) {
      setTurns(turns);
      setInput(message);
      setError(sendError instanceof Error ? sendError.message : "Could not get a response.");
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {turns.length > 0 && (
        <div className="max-h-[36svh] space-y-3 overflow-y-auto px-4 pb-4" aria-live="polite">
          {turns.map((turn, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${turn.role === "user" ? "ml-auto max-w-[85%] bg-[var(--bg-tertiary)]" : "max-w-full"}`}
            >
              {turn.content}
            </div>
          ))}
          {loading && <p className="px-4 text-sm text-[var(--text-secondary)]">Thinking…</p>}
        </div>
      )}

      <form
        onSubmit={send}
        className="mx-auto w-full rounded-3xl px-[8.5px] py-[7px]"
        style={{ background: "var(--bg-elevated-primary)", boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset" }}
      >
        <input
          className="w-full border-0 bg-transparent px-3 py-3 text-base outline-none sm:text-[15px]"
          placeholder="Ask Anything"
          aria-label="Ask anything"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={loading || showSignup || remaining <= 0}
        />
        <div className="flex items-center justify-between px-2 pb-1">
          <p className="text-xs text-[var(--text-secondary)]">{remaining} free messages remaining</p>
          <button
            type="submit"
            disabled={loading || !input.trim() || showSignup || remaining <= 0}
            className="rounded-full px-4 py-2 text-sm disabled:opacity-50"
            style={{ background: "var(--text-primary)", color: "var(--text-inverted)" }}
          >
            Send
          </button>
        </div>
        {error && <p role="alert" className="px-3 pb-2 text-sm text-red-500">{error}</p>}
      </form>

      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="guest-signup-title">
          <div className="w-full max-w-sm rounded-2xl p-6 text-center shadow-xl" style={{ background: "var(--bg-elevated-primary)", color: "var(--text-primary)" }}>
            <h2 id="guest-signup-title" className="text-xl font-medium">Continue chatting</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">You’ve used your two free messages. Log in or sign up to keep chatting.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/auth" className="rounded-full border px-4 py-2 text-sm">Log in</Link>
              <Link href="/auth" className="rounded-full px-4 py-2 text-sm" style={{ background: "var(--text-primary)", color: "var(--text-inverted)" }}>Sign up</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
