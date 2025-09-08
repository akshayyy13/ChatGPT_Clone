"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff } from "lucide-react"; // You'll need to install lucide-react
import { DM_Sans } from "next/font/google";
import { signIn, getSession } from "next-auth/react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // add weights you need
});
export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [authMode, setAuthMode] = useState<"email" | "login" | "signup" | null>(
    null
  );
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    isValid: false,
  });

  const router = useRouter();

  // Check if email exists in database
  // Check if email exists in database
  async function checkEmailExists(email: string) {
    try {
      console.log("🔍 Checking email:", email);

      const response = await fetch("/api/auth/checkEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include", // Important for cookies
      });

      console.log("📋 Response status:", response.status);

      if (!response.ok) {
        console.error("❌ API responded with error:", response.status);
        // If API fails, default to treating as new user
        return false;
      }

      const data = await response.json();
      console.log("✅ Email check result:", data);

      return data.exists;
    } catch (error) {
      console.error("🚨 Fetch error in checkEmailExists:", error);
      // If fetch fails completely, default to treating as new user
      return false;
    }
  }

  // Handle email submission
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const emailExists = await checkEmailExists(email);
    setLoading(false);

    if (emailExists) {
      setAuthMode("login");
    } else {
      setAuthMode("signup");
    }
  }

  // Handle password validation for signup
  function validatePassword(password: string) {
    const lengthValid = password.length >= 12;
    setPasswordValidation({
      length: lengthValid,
      isValid: lengthValid,
    });
  }

  // Handle login submission
 async function handleLogin(e: React.FormEvent) {
   e.preventDefault();
   setLoading(true);
   setLoginError("");

   try {
     const res = await signIn("credentials", {
       email,
       password,
       redirect: false, // Keep false for error handling
     });

     console.log("🔍 SignIn response:", res);

     // ✅ FIXED: Check for errors properly in NextAuth v5
     if (res?.error) {
       console.log("❌ Login error:", res.error);

       // Display the custom error message from your auth.ts
       setLoginError(res.error);
       setLoading(false);
       return;
     }

     // ✅ FIXED: Success case - check session before redirect
     if (res?.ok) {
       console.log("✅ Login successful, checking session...");

       // Small delay to ensure session is properly set
       setTimeout(async () => {
         const session = await getSession();
         console.log("🔍 Session after login:", session);

         if (session?.user) {
           console.log("✅ Session confirmed, redirecting to chat");
           router.push("/chat");
         } else {
           console.log("❌ No session found after successful login");
           setLoginError("Session error. Please try again.");
         }
         setLoading(false);
       }, 500);
     } else {
       console.log("❌ Login failed - unknown error");
       setLoginError("Login failed. Please try again.");
       setLoading(false);
     }
   } catch (error) {
     console.error("🚨 Login exception:", error);
     setLoginError("Login failed. Please try again.");
     setLoading(false);
   }
 }


  // Handle signup submission
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordValidation.isValid) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to OTP verification
        router.push(`/auth/verifyOtp?email=${encodeURIComponent(email)}`);
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      alert("Signup failed. Please try again.");
    }

    setLoading(false);
  }

  // Reset to email entry mode
  function handleEditEmail() {
    setIsEmailEditing(true);
    setAuthMode("email");
    setPassword("");
    setLoginError(""); // Clear any login errors
  }

  useEffect(() => {
    console.log("🔄 authMode changed to:", authMode);
    console.trace("Stack trace:"); // Shows what caused the change
  }, [authMode]);

  useEffect(() => {
    console.log("🚨 loginError changed to:", loginError);
  }, [loginError]);

  return (
    <main
      className={`${dmSans} min-h-screen relative bg-[#f9f9f9] flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md min-[800px]:pt-22 min-w-[800px]:pt-0">
        {/* Header */}
        <div className="text-center cursor-default min-[800px]:mb-8 min-[800px]:absolute min-[800px]:left-5 min-[800px]:top-5 ">
          <h1
            className={`text-xl min-[800px]:text-2xl ${dmSans.className} font-bold text-gray-900 mb-2`}
          >
            ChatGPT
          </h1>
        </div>

        <div className="bg-[#f9f9f9] rounded-lg p-3 space-y-4 max-w-[23rem] mx-auto">
          {/* Email Entry Mode */}
          {(!authMode || authMode === "email") && (
            <div>
              <div className="text-center">
                <h2 className="text-3xl font-[430] text-gray-900 mb-2">
                  Log in or sign up
                </h2>
                <p className="text-[16px] font-light text-gray-600 mb-6">
                  {`You'will get smarter responses and can upload files, images,
                  and more.`}
                </p>
              </div>

              <form
                onSubmit={handleEmailSubmit}
                className=" pt-3 flex flex-col gap-6 w-full"
              >
                <div className="input-field w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className=" field "
                    id="email1"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="email1">Email address</label>
                  <div className="field-focus" />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className={`w-full bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer text-white font-light py-3 px-4 rounded-full transition-colors ${
                    loading ? "hover:cursor-not-allowed" : ""
                  }`}
                >
                  {"Continue"}
                </button>
              </form>
              <div className=" flex flex-row justify-between my-5 gap-4 items-center">
                <div className=" h-[1px] w-full bg-[var(--bg-tertiary)] opacity-10"></div>
                <div className="font-semibold text-sm text-[var(--interactive-label-primary-default)]">
                  OR
                </div>
                <div className=" h-[1px] w-full bg-[var(--bg-tertiary)] opacity-10 "></div>
              </div>

              {/* Social Login Options */}
              <div className="space-y-3">
                <button
                  onClick={() => signIn("google", { callbackUrl: "/chat" })}
                  className="w-full flex items-center justify-start gap-3 bg-[#f9f9f9] border border-gray-300 cursor-pointer text-[var(--text-inverted)] hover:bg-gray-100 font-light py-3 px-4 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
                <button className="w-full flex items-center justify-start gap-3 bg-[#f9f9f9] border border-gray-300 cursor-pointer text-[var(--text-inverted)] hover:bg-gray-100 font-light py-3 px-4 rounded-full transition-colors">
                  <Image
                    width="16"
                    height="16"
                    alt="Microsoft logo"
                    className="_root_jbbqu_1"
                    src="https://auth-cdn.oaistatic.com/assets/microsoft-logo-BUXxQnXH.svg"
                  />
                  Continue with Microsoft Account
                </button>

                <button className="w-full flex items-center justify-start gap-3 bg-[#f9f9f9] border border-gray-300 cursor-pointer text-[var(--text-inverted)] hover:bg-gray-100 font-light py-3 px-4 rounded-full transition-colors">
                  <Image
                    width="17"
                    height="17"
                    alt="Apple logo"
                    className="_root_jbbqu_1"
                    src="https://auth-cdn.oaistatic.com/assets/apple-logo-vertically-balanced-rwLdlt8P.svg"
                  />
                  Continue with Apple
                </button>
                <button className="w-full flex items-center justify-start gap-3 bg-[#f9f9f9] border border-gray-300 cursor-pointer text-[var(--text-inverted)] hover:bg-gray-100 font-light py-3 px-4 rounded-full transition-colors">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2 5.57143C2 3.59898 3.59898 2 5.57143 2H8.625C9.0287 2 9.39281 2.24274 9.54808 2.61538L11.4231 7.11538C11.5744 7.47863 11.4987 7.89686 11.2295 8.18394L9.82741 9.67954C10.9044 11.7563 12.2732 13.2047 14.3016 14.2842L15.7929 12.7929C16.0794 12.5064 16.5106 12.4211 16.8846 12.5769L21.3846 14.4519C21.7573 14.6072 22 14.9713 22 15.375V18.4286C22 20.401 20.401 22 18.4286 22C9.35532 22 2 14.6447 2 5.57143ZM5.57143 4C4.70355 4 4 4.70355 4 5.57143C4 13.5401 10.4599 20 18.4286 20C19.2964 20 20 19.2964 20 18.4286V16.0417L16.7336 14.6807L15.2071 16.2071C14.9098 16.5044 14.4582 16.584 14.0771 16.4062C11.0315 14.9849 9.12076 12.9271 7.71882 9.92289C7.54598 9.55251 7.61592 9.11423 7.89546 8.81606L9.32824 7.28777L7.95833 4H5.57143Z"
                      fill="currentColor"
                    ></path>
                  </svg>{" "}
                  Continue with phone
                </button>
              </div>
            </div>
          )}

          {/* Login Mode */}
          {authMode === "login" && (
            <div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Enter your password
                </h2>
              </div>

              <div className="space-y-4 relative">
                <div className="flex items-center gap-2 text-sm text-[rgb(184,184,184)]">
                  <span className=" absolute bg-[#f9f9f9] p-2 top-0 left-5 z-20">
                    Email address
                  </span>
                </div>
                <div className="relative text-[var(--text-inverted)] font-normal w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-full focus:outline-none flex items-center">
                  <span className="truncate max-w-[calc(100%-60px)]">
                    {email}
                  </span>
                  <button
                    onClick={handleEditEmail}
                    className="absolute right-3 p-2 top-1/2 transform -translate-y-1/2 text-[#3e68ff] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-0">
                  <div className="relative">
                    <div className="relative input-field w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validatePassword(e.target.value);
                          if (loginError) setLoginError(""); // Clear error when user starts typing
                        }}
                        className={`field ${loginError ? "error-state" : ""}`}
                        id="password12"
                        placeholder=" "
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-2 top-1/2 transform -translate-y-1/2 text-[var(--text-inverted)] hover:bg-gray-200 rounded-full cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5.91444 7.59106C4.3419 9.04124 3.28865 10.7415 2.77052 11.6971C2.66585 11.8902 2.66585 12.1098 2.77052 12.3029C3.28865 13.2585 4.3419 14.9588 5.91444 16.4089C7.48195 17.8545 9.50572 19 12 19C14.4943 19 16.518 17.8545 18.0855 16.4089C19.6581 14.9588 20.7113 13.2585 21.2295 12.3029C21.3341 12.1098 21.3341 11.8902 21.2295 11.6971C20.7113 10.7415 19.6581 9.04124 18.0855 7.59105C16.518 6.1455 14.4943 5 12 5C9.50572 5 7.48195 6.1455 5.91444 7.59106ZM4.55857 6.1208C6.36059 4.45899 8.84581 3 12 3C15.1542 3 17.6394 4.45899 19.4414 6.1208C21.2384 7.77798 22.4152 9.68799 22.9877 10.7438C23.4147 11.5315 23.4147 12.4685 22.9877 13.2562C22.4152 14.312 21.2384 16.222 19.4414 17.8792C17.6394 19.541 15.1542 21 12 21C8.84581 21 6.36059 19.541 4.55857 17.8792C2.76159 16.222 1.58478 14.312 1.01232 13.2562C0.58525 12.4685 0.585249 11.5315 1.01232 10.7438C1.58478 9.688 2.76159 7.77798 4.55857 6.1208ZM12 9.5C10.6193 9.5 9.49999 10.6193 9.49999 12C9.49999 13.3807 10.6193 14.5 12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5ZM7.49999 12C7.49999 9.51472 9.51471 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51471 16.5 7.49999 14.4853 7.49999 12Z"
                              fill="currentColor"
                            />
                          </svg>
                        )}
                      </button>
                      <label htmlFor="password12">Password</label>
                      <div className="field-focus" />
                    </div>
                  </div>

                  {/* Error message div - with fallback styling */}
                  {loginError && (
                    <div className="flex items-center text-[12px] text-red-700">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-light">
                        Incorrect email address or password
                      </span>
                    </div>
                  )}

                  <div className="my-4 flex justify-start font-light">
                    <button
                      type="button"
                      className="text-sm text-[#3e68ff] cursor-pointer disabled:opacity-50 transition-opacity hover:opacity-80"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className={`w-full bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer text-white font-light py-3 px-4 rounded-full transition-colors ${
                      loading
                        ? "bg-[var(--bg-tertiary)] hover:cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {"Continue"}
                  </button>
                </form>

                <div className=" flex flex-row justify-between my-5 gap-4 items-center">
                  <div className=" h-[1px] w-full bg-[var(--bg-tertiary)] opacity-10"></div>
                  <div className="font-semibold text-sm text-[var(--interactive-label-primary-default)]">
                    OR
                  </div>
                  <div className=" h-[1px] w-full bg-[var(--bg-tertiary)] opacity-10 "></div>
                </div>

                {/* Social Login Options */}
                <div className="space-y-3">
                  <button
                    onClick={() => signIn("google", { callbackUrl: "/chat" })}
                    className="w-full flex items-center justify-start gap-3 bg-[#f9f9f9] border border-gray-300 cursor-pointer text-[var(--text-inverted)] hover:bg-gray-100 font-light py-3 px-4 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                  <button className="w-full flex items-center justify-start gap-3 bg-[#f9f9f9] border border-gray-300 cursor-pointer text-[var(--text-inverted)] hover:bg-gray-100 font-light py-3 px-4 rounded-full transition-colors">
                    <Image
                      width="16"
                      height="16"
                      alt="Microsoft logo"
                      className="_root_jbbqu_1"
                      src="https://auth-cdn.oaistatic.com/assets/microsoft-logo-BUXxQnXH.svg"
                    />
                    Continue with Microsoft Account
                  </button>

                  <button className="w-full flex items-center justify-start gap-3 bg-[#f9f9f9] border border-gray-300 cursor-pointer text-[var(--text-inverted)] hover:bg-gray-100 font-light py-3 px-4 rounded-full transition-colors">
                    <Image
                      width="17"
                      height="17"
                      alt="Apple logo"
                      className="_root_jbbqu_1"
                      src="https://auth-cdn.oaistatic.com/assets/apple-logo-vertically-balanced-rwLdlt8P.svg"
                    />
                    Continue with Apple
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Signup Mode */}
          {authMode === "signup" && (
            <div className=" min-[800px]:-mt-30">
              <div className="text-center">
                <h2 className="text-3xl font-normal text-gray-900 mb-2">
                  Create your account
                </h2>
                <p className="text-[16px] font-light text-gray-600 mb-6">
                  Set your password for OpenAI to continue
                </p>
              </div>

              <div className="space-y-4 relative">
                <div className="flex items-center gap-2 text-sm text-[rgb(184,184,184)]">
                  <span className=" absolute bg-[#f9f9f9] p-2 top-0 left-5 z-20">
                    Email address
                  </span>
                </div>
                <div className="relative text-[var(--text-inverted)] font-normal w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-full focus:outline-none flex items-center">
                  <span className="truncate max-w-[calc(100%-60px)]">
                    {email}
                  </span>
                  <button
                    onClick={handleEditEmail}
                    className="absolute right-3 p-2 top-1/2 transform -translate-y-1/2 text-[#3e68ff] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="relative">
                    <div className="relative input-field w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validatePassword(e.target.value);
                        }}
                        className=" field "
                        id="password1"
                        placeholder=" "
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 p-2  top-1/2 transform -translate-y-1/2 text-[var(--text-inverted)] hover:bg-gray-200 rounded-full cursor-pointer `}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5.91444 7.59106C4.3419 9.04124 3.28865 10.7415 2.77052 11.6971C2.66585 11.8902 2.66585 12.1098 2.77052 12.3029C3.28865 13.2585 4.3419 14.9588 5.91444 16.4089C7.48195 17.8545 9.50572 19 12 19C14.4943 19 16.518 17.8545 18.0855 16.4089C19.6581 14.9588 20.7113 13.2585 21.2295 12.3029C21.3341 12.1098 21.3341 11.8902 21.2295 11.6971C20.7113 10.7415 19.6581 9.04124 18.0855 7.59105C16.518 6.1455 14.4943 5 12 5C9.50572 5 7.48195 6.1455 5.91444 7.59106ZM4.55857 6.1208C6.36059 4.45899 8.84581 3 12 3C15.1542 3 17.6394 4.45899 19.4414 6.1208C21.2384 7.77798 22.4152 9.68799 22.9877 10.7438C23.4147 11.5315 23.4147 12.4685 22.9877 13.2562C22.4152 14.312 21.2384 16.222 19.4414 17.8792C17.6394 19.541 15.1542 21 12 21C8.84581 21 6.36059 19.541 4.55857 17.8792C2.76159 16.222 1.58478 14.312 1.01232 13.2562C0.58525 12.4685 0.585249 11.5315 1.01232 10.7438C1.58478 9.688 2.76159 7.77798 4.55857 6.1208ZM12 9.5C10.6193 9.5 9.49999 10.6193 9.49999 12C9.49999 13.3807 10.6193 14.5 12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5ZM7.49999 12C7.49999 9.51472 9.51471 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51471 16.5 7.49999 14.4853 7.49999 12Z"
                              fill="currentColor"
                            ></path>
                          </svg>
                        )}
                      </button>
                      <label htmlFor="password1"> Password</label>
                      <div className="field-focus" />
                    </div>
                  </div>

                  {/* Password Validation */}
                  {password && (
                    <div className="p-3 border font-light border-gray-300 rounded-xs">
                      <p className="text-sm  text-gray-800 mb-2">
                        Your password must contain:
                      </p>
                      <div className="flex items-center gap-5 text-sm">
                        {passwordValidation.isValid && (
                          <span
                            className={`w-[3px] h-[3px]  rounded-full bg-[#3e68ff]
                            }`}
                          ></span>
                        )}
                        {!passwordValidation.isValid && (
                          <span
                            className={`w-[3px] h-[3px] rounded-full bg-gray-800
                            }`}
                          ></span>
                        )}

                        <span
                          className={
                            passwordValidation.length
                              ? "text-[#3e68ff]"
                              : "text-gray-700"
                          }
                        >
                          At least 12 characters
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !passwordValidation.isValid}
                    className={`w-full bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer text-white font-medium py-3 px-4 rounded-full transition-colors ${
                      loading || !passwordValidation.isValid
                        ? " hover:cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {"Continue"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-15 min-[800px]:pt-10">
            <div className="space-x-4  ">
              <button className="underline cursor-pointer">Terms of Use</button>
              <span>|</span>
              <button className=" underline cursor-pointer">
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
