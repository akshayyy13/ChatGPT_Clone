// src/app/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient, dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

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
  adapter: MongoDBAdapter(await getMongoClient()),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: creds.email });
        if (!user?.passwordHash) return null; // don't log in OAuth-only users via credentials
        const ok = await bcrypt.compare(
          creds.password as string,
          user.passwordHash
        );
        if (!ok) return null;
        return {
          id: user._id.toString(),
          name: user.name || "",
          email: user.email,
          image: user.image || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id as string;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.uid) {
        session.user.id = token.uid;
      }
      return session;
    },
  },
});
