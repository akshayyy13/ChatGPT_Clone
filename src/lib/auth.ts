// src/lib/auth.ts

import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient, dbConnect } from "@/app/lib/db";
import NextAuth, { CredentialsSignin } from "next-auth";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
class InvalidLoginError extends CredentialsSignin {
  code = "credentials";
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    uid?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ✅ FIXED: Proper adapter initialization without await at module level
  adapter: MongoDBAdapter(getMongoClient()),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debugging in development
  debug: process.env.NODE_ENV === "development",

  // ✅ IMPROVED: Better cookie configuration for localhost
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // ✅ IMPORTANT: false for localhost development
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        console.log("🔍 Authorize function called with:", {
          email: creds?.email,
        });

        if (!creds?.email || !creds?.password) {
          console.log("❌ Missing credentials");
          throw new InvalidLoginError("Please provide both email and password");
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: creds.email });

          if (!user) {
            console.log("❌ User not found:", creds.email);
            throw new InvalidLoginError("Invalid email or password");
          }

          // Special case for verified users (after OTP verification)
          if (creds.password === "verified" && user.emailVerified) {
            console.log("✅ OTP verified login for:", user.email);
            return {
              id: user._id.toString(),
              name: user.name || "",
              email: user.email,
              image: user.image || undefined,
            };
          }

          // Regular password verification
          if (!user?.passwordHash) {
            console.log("❌ No password hash found for:", user.email);
            throw new InvalidLoginError("Account setup incomplete");
          }

          // Check if credentials user has verified email
          if (user.provider === "credentials" && !user.emailVerified) {
            console.log(
              "❌ Email not verified for credentials user:",
              user.email
            );
            throw new InvalidLoginError("Please verify your email first");
          }

          const passwordMatch = await bcrypt.compare(
            creds.password as string,
            user.passwordHash
          );

          if (!passwordMatch) {
            console.log("❌ Invalid password for user:", user.email);
            throw new InvalidLoginError(
              "Incorrect password. Please try again."
            );
          }

          console.log("✅ Successful login for:", user.email);
          return {
            id: user._id.toString(),
            name: user.name || "",
            email: user.email,
            image: user.image || undefined,
          };
        } catch (error) {
          console.error("🚨 Error in authorize function:", error);
          if (error instanceof InvalidLoginError) {
            throw error; // Re-throw custom errors
          }
          throw new InvalidLoginError("Login failed. Please try again.");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log("🔄 JWT callback - trigger:", trigger);

      if (user?.id) {
        token.uid = user.id as string;
        console.log("✅ Added user ID to token:", user.id);
      }

      return token;
    },

    async session({ session, token }) {
      console.log("🔄 Session callback - token:", { uid: token?.uid });

      if (session.user && token?.uid) {
        session.user.id = token.uid;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      console.log("🔄 SignIn callback - provider:", account?.provider);

      if (account?.provider === "google") {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            console.log("🆕 Creating new Google user:", user.email);
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: true,
              provider: "google",
            });
          } else {
            console.log("✅ Existing Google user found:", user.email);
          }
        } catch (error) {
          console.error("🚨 Error in Google signIn callback:", error);
          return false;
        }
      }

      return true;
    },
  },

  pages: {
    signIn: "/auth",
  },
});
