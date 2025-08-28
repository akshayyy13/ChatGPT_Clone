// src/app/page.tsx
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    // Signed in → go to /chat, which then routes to the latest thread
    redirect("/chat");
  }

  // Not signed in → render existing public landing
  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Top-right auth buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <Link
          href="/signin"
          className="text-sm px-3 py-1.5 rounded-full transition"
          style={{
            background: "var(--interactive-bg-secondary-default)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
          }}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="text-sm px-3 py-1.5 rounded-full transition"
          style={{
            background: "var(--text-primary)",
            color: "var(--text-inverted)",
          }}
        >
          Sign up for free
        </Link>
      </div>

      {/* Center hero */}
      <section className="h-[100dvh] grid place-items-center px-4">
        <div className="w-full max-w-4xl text-center">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8"
            style={{ color: "var(--text-primary)" }}
          >
            ChatGPT
          </h1>

          {/* Input shell */}
          <div
            className="mx-auto w-full rounded-[20px]"
            style={{
              background: "var(--bg-elevated-primary)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
            }}
          >
            <div className="h-3" />
            <div className="px-4 sm:px-5 pb-3">
              <div className="flex items-center gap-3">
                {/* Left pills (hidden on xs) */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition"
                    style={{
                      background: "var(--interactive-bg-secondary-default)",
                      border:
                        "1px solid var(--interactive-border-secondary-default)",
                      color: "var(--interactive-label-secondary-default)",
                    }}
                  >
                    <span
                      className="inline-block w-4 h-4 rounded"
                      style={{ background: "var(--icon-secondary)" }}
                    />
                    Attach
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition"
                    style={{
                      background: "var(--interactive-bg-secondary-default)",
                      border:
                        "1px solid var(--interactive-border-secondary-default)",
                      color: "var(--interactive-label-secondary-default)",
                    }}
                  >
                    <span
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ background: "var(--icon-secondary)" }}
                    />
                    Search
                  </button>
                </div>

                {/* Input (decorative on landing) */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <input
                      className="w-full bg-transparent outline-none border-0 text-base sm:text-[15px] py-3"
                      placeholder="Ask anything"
                      aria-label="Ask anything"
                      style={{ color: "var(--text-primary)" }}
                      readOnly
                    />
                    <span className="pointer-events-none absolute right-24 top-1/2 -translate-y-1/2 hidden sm:block">
                      <span
                        className="inline-block w-[2px] h-4 animate-pulse"
                        style={{ background: "var(--icon-secondary)" }}
                      />
                    </span>
                  </div>
                </div>

                {/* Right voice */}
                <div className="flex items-center">
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition"
                    style={{
                      background: "var(--interactive-bg-secondary-default)",
                      border:
                        "1px solid var(--interactive-border-secondary-default)",
                      color: "var(--interactive-label-secondary-default)",
                    }}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ background: "var(--icon-secondary)" }}
                    />
                    Voice
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Helper row on small screens */}
          <div className="mt-3 flex sm:hidden items-center justify-center gap-2">
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition"
              style={{
                background: "var(--interactive-bg-secondary-default)",
                border: "1px solid var(--interactive-border-secondary-default)",
                color: "var(--interactive-label-secondary-default)",
              }}
            >
              <span
                className="inline-block w-4 h-4 rounded"
                style={{ background: "var(--icon-secondary)" }}
              />
              Attach
            </button>
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition"
              style={{
                background: "var(--interactive-bg-secondary-default)",
                border: "1px solid var(--interactive-border-secondary-default)",
                color: "var(--interactive-label-secondary-default)",
              }}
            >
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ background: "var(--icon-secondary)" }}
              />
              Search
            </button>
          </div>
        </div>
      </section>

      <footer className="absolute bottom-3 left-0 right-0">
        <p
          className="text-center text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          By messaging ChatGPT, you agree to our Terms and have read our Privacy
          Policy. See Cookie Preferences.
        </p>
      </footer>
    </main>
  );
}
