"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Component that uses useSearchParams - wrapped in Suspense
function VerifyOTPContent() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams(); // Now safely inside Suspense

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push("/auth");
    }
  }, [searchParams, router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        const res = await signIn("credentials", {
          email,
          password: "verified",
          redirect: false,
        });

        if (res?.ok) {
          router.push(`/auth/profile?email=${encodeURIComponent(email)}`);
        }
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setError("");
        console.log("✅ New verification code sent to:", email);
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);

    if (value.length > 0 && value.length < 6) {
      setError("The verification code should be exactly 6 characters long");
    } else {
      setError("");
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4">
      <div className="w-full max-w-md min-[800px]:-mt-55">
        <div className="text-center cursor-default min-[800px]:mb-8 min-[800px]:absolute min-[800px]:left-5 min-[800px]:top-5">
          <h1
            className={`text-xl min-[800px]:text-2xl ${dmSans.className} font-bold text-gray-900 mb-2`}
          >
            ChatGPT
          </h1>
        </div>

        <div className="bg-[#f9f9f9] rounded-lg p-3 space-y-4 max-w-[24.5rem] mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-[430] text-gray-900 mb-2">
              Check your inbox
            </h2>
            <p className="text-[16px] font-light text-gray-600 mb-6">
              Enter the verification code we just sent to
              <br />
              <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="input-field w-full">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder=" "
                id="otp"
                className={`field ${
                  otp.length < 6 && otp.length > 0
                    ? "error-state border-red-500 focus:border-red-500 focus:ring-red-200"
                    : ""
                }`}
                maxLength={6}
                required
              />
              <label htmlFor="otp">Code</label>
              <div className="field-focus" />
            </div>

            {error && (
              <div className="flex flex-row justify-center items-center text-red-600 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334z"
                    fill="#D00E17"
                    stroke="#D00E17"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 4.583a.75.75 0 0 1 .75.75V8a.75.75 0 0 1-1.5 0V5.333a.75.75 0 0 1 .75-.75z"
                    fill="#fff"
                  ></path>
                  <path
                    d="M8.667 10.667a.667.667 0 1 1-1.334 0 .667.667 0 0 1 1.334 0z"
                    fill="#fff"
                  ></path>
                </svg>
                <p className=" text-[12px] font-light">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-white py-3 rounded-full font-light cursor-pointer transition-colors ${
                loading ? "hover:cursor-not-allowed" : ""
              }`}
            >
              {"Continue"}
            </button>
          </form>

          <div className="text-center mb-10">
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-[var(--text-inverted)] cursor-pointer disabled:opacity-50 transition-opacity"
            >
              {resendLoading ? "Sending..." : "Resend email"}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 space-x-4">
            <a href="#" className="hover:underline">
              Terms of Use
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main component with Suspense boundary
export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading verification...</p>
          </div>
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
