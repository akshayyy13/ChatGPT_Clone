"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) router.push("/chat");
    else alert(res?.error || "Failed to sign in");
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div
        className="w-full max-w-sm space-y-3 rounded-2xl p-4"
        style={{
          background: "var(--bg-elevated-primary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <h1 className="text-xl font-semibold">Sign in</h1>

        {/* Google OAuth */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/chat" })}
          className="w-full rounded py-2"
          style={{
            background: "var(--interactive-bg-tertiary-default)",
            border: "1px solid var(--interactive-border-tertiary-default)",
            color: "var(--interactive-label-secondary-default)",
          }}
        >
          Continue with Google
        </button>

        <div className="text-xs opacity-70 text-center">or</div>

        {/* Credentials login */}
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          />
          <input
            className="w-full rounded px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          />
          <button
            disabled={loading}
            className="w-full rounded py-2"
            style={{
              background: "var(--interactive-bg-primary-default)",
              color: "var(--interactive-label-primary-default)",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
