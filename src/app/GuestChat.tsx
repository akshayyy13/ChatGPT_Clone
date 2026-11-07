"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Turn = { role: "user" | "assistant"; content: string };

export default function GuestChat() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedTurns = sessionStorage.getItem("guest-chat-turns");
      if (savedTurns) {
        const restoredTurns = JSON.parse(savedTurns) as Turn[];
        const validTurns = Array.isArray(restoredTurns) && restoredTurns.every(
          (turn) => turn && ["user", "assistant"].includes(turn.role) && typeof turn.content === "string"
        );
        if (validTurns) setTurns(restoredTurns);
        else sessionStorage.removeItem("guest-chat-turns");
        if (validTurns && restoredTurns.filter((turn) => turn.role === "assistant").length >= 2) {
          setShowSignup(true);
        }
      }
    } catch {
      try {
        sessionStorage.removeItem("guest-chat-turns");
      } catch {
        // Guest chat still works when browser storage is unavailable.
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        sessionStorage.setItem("guest-chat-turns", JSON.stringify(turns));
      } catch {
        // Keep the current conversation usable if storage is full or blocked.
      }
    }
  }, [ready, turns]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading || turns.filter((turn) => turn.role === "user").length >= 2) return;

    setInput("");
    setError("");
    setLoading(true);
    const nextTurns: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(nextTurns);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch("/api/chat/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextTurns }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not get a response. Please try again.");
      setTurns([...nextTurns, { role: "assistant", content: data.reply }]);
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
        <div className="max-h-[36svh] overflow-y-auto px-4 pb-4 space-y-3" aria-live="polite">
          {turns.map((turn, index) => (
            <div key={index} className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${turn.role === "user" ? "ml-auto max-w-[85%] bg-[var(--bg-tertiary)]" : "max-w-full"}`}>
              {turn.content}
            </div>
          ))}
          {loading && <p className="px-4 text-sm text-[var(--text-secondary)]">Thinking…</p>}
        </div>
      )}
      <form onSubmit={send} className="mx-auto w-full rounded-3xl px-[8.5px] py-[7px]" style={{ background: "var(--bg-elevated-primary)", boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset" }}>
        <input
          className="w-full bg-transparent outline-none border-0 text-base sm:text-[15px] py-3 px-3"
          placeholder="Ask Anything"
          aria-label="Ask anything"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={loading || showSignup}
        />
        <div className="flex justify-between items-center px-2 pb-1">
          <p className="text-xs text-[var(--text-secondary)]">{2 - turns.filter((turn) => turn.role === "user").length} free messages remaining</p>
          <button type="submit" disabled={loading || !input.trim() || showSignup} className="rounded-full px-4 py-2 text-sm disabled:opacity-50" style={{ background: "var(--text-primary)", color: "var(--text-inverted)" }}>
            Send
          </button>
        </div>
        {error && <p role="alert" className="px-3 pb-2 text-sm text-red-500">{error}</p>}
      </form>
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="guest-signup-title">
          <div className="w-full max-w-sm rounded-2xl p-6 text-center shadow-xl" style={{ background: "var(--bg-elevated-primary)", color: "var(--text-primary)" }}>
            <h2 id="guest-signup-title" className="text-xl font-medium">Continue chatting</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">You’ve used your two free messages. Log in or create an account to keep going.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/auth" className="rounded-full border px-4 py-2 text-sm">Log in</Link>
              <Link href="/auth" className="rounded-full px-4 py-2 text-sm" style={{ background: "var(--text-primary)", color: "var(--text-inverted)" }}>Sign up</Link>
            </div>
            <button onClick={() => setShowSignup(false)} className="mt-4 text-sm text-[var(--text-secondary)]">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
