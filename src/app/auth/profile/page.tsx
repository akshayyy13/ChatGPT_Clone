"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { DM_Sans } from "next/font/google";
import { useSession } from "next-auth/react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Component containing all your profile logic
function ProfileContent() {
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBirthdayFocused, setIsBirthdayFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Now safely inside Suspense
  const email = searchParams.get("email");
  const { update } = useSession();

  useEffect(() => {
    if (!email) {
      router.push("/auth");
    }
  }, [email, router]);

  // Improved birthday formatting with validation
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    let value = input.replace(/\D/g, ""); // Remove non-digits

    // Handle backspace - if user deletes a slash, remove the number before it
    if (
      input.length < birthday.length &&
      (input.endsWith("/") || birthday.charAt(input.length) === "/")
    ) {
      value = value.slice(0, -1);
    }

    // Validate and format each part
    let month = value.substring(0, 2);
    let day = value.substring(2, 4);
    const year = value.substring(4, 8);

    // Month validation (01-12)
    if (month.length === 2) {
      let monthNum = parseInt(month);
      if (monthNum > 12) {
        monthNum = monthNum > 19 ? Math.floor(monthNum / 10) : 12; // Handle cases like 13-19 vs 23, 34 etc
      }
      if (monthNum === 0) monthNum = 1; // No month 00
      month = monthNum.toString().padStart(2, "0");
    } else if (month.length === 1 && parseInt(month) > 1) {
      // If first digit is > 1, auto-pad with 0 (e.g., 2 becomes 02)
      if (parseInt(month) > 1) {
        month = "0" + month;
      }
    }

    // Day validation (01-31)
    if (day.length === 2) {
      let dayNum = parseInt(day);
      if (dayNum > 31) {
        dayNum = dayNum > 39 ? Math.floor(dayNum / 10) : 31; // Handle cases like 32-39 vs 42, 53 etc
      }
      if (dayNum === 0) dayNum = 1; // No day 00
      day = dayNum.toString().padStart(2, "0");
    } else if (day.length === 1 && parseInt(day) > 3) {
      // If first digit is > 3, auto-pad with 0 (e.g., 4 becomes 04)
      day = "0" + day;
    }

    // Reconstruct the value
    value = month + day + year;

    // Format as MM/DD/YYYY
    if (value.length >= 2 && value.length < 4) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    } else if (value.length >= 4) {
      value =
        value.substring(0, 2) +
        "/" +
        value.substring(2, 4) +
        "/" +
        value.substring(4, 8);
    }

    setBirthday(value);
  };

  // Get dynamic format for birthday overlay
  const getFormattedPlaceholder = () => {
    const cleanValue = birthday.replace(/\D/g, "");
    const month = cleanValue.substring(0, 2);
    const day = cleanValue.substring(2, 4);
    const year = cleanValue.substring(4, 8);

    return {
      month:
        month.length === 2
          ? month
          : (month + "M".repeat(2 - month.length)).substring(0, 2),
      day:
        day.length === 2
          ? day
          : (day + "D".repeat(2 - day.length)).substring(0, 2),
      year:
        year.length === 4
          ? year
          : (year + "Y".repeat(4 - year.length)).substring(0, 4),
      monthFilled: month.length === 2,
      dayFilled: day.length === 2,
      yearFilled: year.length === 4,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || birthday.length !== 10) return;

    setLoading(true);
    try {
      // Update user profile
      const response = await fetch("/api/auth/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim(), birthday }),
      });

      if (response.ok) {
        console.log("✅ Profile updated successfully");

        // Auto login after profile completion
        const res = await signIn("credentials", {
          email,
          password: "verified",
          redirect: false,
        });

        console.log("🔍 SignIn response:", res);

        if (res?.ok) {
          console.log(
            "✅ Login successful, forcing page reload to ensure session"
          );

          // Use window.location.href for reliable redirect with fresh session
          window.location.href = "/chat";
        } else {
          console.error("❌ Login failed:", res?.error);
          alert("Login failed. Please try logging in manually.");
          router.push("/auth");
        }
      } else {
        console.error("❌ Profile update failed:", response.status);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("🚨 Profile update error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4">
      <div className="w-full min-[800px]:-mt-55 max-w-[21.5rem]">
        <div className="text-center cursor-default min-[800px]:mb-8 min-[800px]:absolute min-[800px]:left-5 min-[800px]:top-5">
          <h1
            className={`text-xl min-[800px]:text-2xl ${dmSans.className} font-bold text-gray-900 mb-2`}
          >
            ChatGPT
          </h1>
        </div>

        <div className="space-y-6">
          <div className="text-center text-[var(--text-inverted)]">
            <h2 className="text-3xl font-normal mb-8">Tell us about you</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input with Floating Label */}
            <div className="relative input-field w-full">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
                placeholder=" "
                required
              />
              <label htmlFor="name">Full Name</label>
              <div className="field-focus" />
            </div>

            {/* Birthday Input with Floating Label */}
            <div className="input-field w-full">
              <input
                type="text"
                id="birthday"
                value={birthday}
                onChange={handleBirthdayChange}
                onFocus={() => setIsBirthdayFocused(true)}
                onBlur={() => setIsBirthdayFocused(false)}
                maxLength={10}
                className={`field ${
                  isBirthdayFocused ? "birthday-focused" : ""
                }`}
                placeholder=" "
                required
              />
              <label htmlFor="birthday">Birthday</label>
              <div className="field-focus" />

              {/* Dynamic Format Overlay - Shows when focused */}
              {isBirthdayFocused && (
                <div className="date-format-overlay">
                  <span
                    className={`date-part ${
                      getFormattedPlaceholder().monthFilled ? "filled" : ""
                    }`}
                  >
                    {getFormattedPlaceholder().month}
                  </span>
                  <span className="date-separator">/</span>
                  <span
                    className={`date-part ${
                      getFormattedPlaceholder().dayFilled ? "filled" : ""
                    }`}
                  >
                    {getFormattedPlaceholder().day}
                  </span>
                  <span className="date-separator">/</span>
                  <span
                    className={`date-part ${
                      getFormattedPlaceholder().yearFilled ? "filled" : ""
                    }`}
                  >
                    {getFormattedPlaceholder().year}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-600 py-4">
              By clicking `Continue`, you agree to our{" "}
              <a href="#" className="text-gray-900 hover:underline">
                Terms
              </a>{" "}
              and have read our{" "}
              <a href="#" className="text-gray-900 hover:underline">
                Privacy Policy
              </a>
              .
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || birthday.length !== 10}
              className={`w-full bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer text-white py-3 rounded-full font-normal transition-colors ${
                loading ? "hover:cursor-not-allowed" : ""
              }`}
            >
              {"Continue"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

// Main component with Suspense boundary
export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
