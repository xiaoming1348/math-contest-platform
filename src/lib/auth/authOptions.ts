import { prisma } from "@/lib/db/prisma";
import type { Session, User } from "next-auth";
import { compare } from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: { email?: string; password?: string } | undefined
      ) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isValid) return null;

        // Return a minimal user object for JWT/session
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          firstName: user.firstName,
          lastName: user.lastName,
        } as unknown as User;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: Record<string, unknown>;
      user?: unknown;
    }) {
      if (user && typeof user === "object") {
        const u = user as Record<string, unknown>;
        token["userId"] = u["id"] as string | undefined;
        token["role"] = u["role"] as string | undefined;
        token["organizationId"] = u["organizationId"] as string | undefined;
        token["firstName"] = u["firstName"] as string | undefined;
        token["lastName"] = u["lastName"] as string | undefined;
      }
      return token;
    },

    // Let TypeScript infer callback parameter types from NextAuth types
    async session({ session, token }) {
      if (session && typeof session === "object") {
        // Cast to unknown first to avoid direct incompatible cast from Session
        const s = session as unknown as Session & {
          user?: Record<string, unknown>;
        };
        s.user = s.user ?? {};
        s.user["userId"] = token["userId"] as string | undefined;
        s.user["role"] = token["role"] as string | undefined;
        s.user["organizationId"] = token["organizationId"] as
          | string
          | undefined;
        s.user["firstName"] = token["firstName"] as string | undefined;
        s.user["lastName"] = token["lastName"] as string | undefined;
        return s as Session;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
