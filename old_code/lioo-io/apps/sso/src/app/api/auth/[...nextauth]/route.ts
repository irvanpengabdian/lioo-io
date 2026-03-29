import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ── DEMO: replace with real DB lookup ──────────────────────────────
        // In production, query your database here and compare hashed passwords.
        // We mock a hardcoded merchant account for local development.
        const DEMO_USERS = [
          {
            id: "merchant-001",
            email: "demo@lioo.io",
            password: "demo1234",
            name: "Demo Merchant",
            tier: "ENTERPRISE",
            image: null,
          },
          {
            id: "sprout-002",
            email: "sprout@lioo.io",
            password: "sprout1234",
            name: "Sprout Cafe",
            tier: "SPROUT",
            image: null,
          },
        ];

        const user = DEMO_USERS.find(
          (u) =>
            u.email === credentials?.email &&
            u.password === credentials?.password
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            // @ts-ignore – custom field passed via JWT
            tier: user.tier,
          };
        }

        // Return null to indicate invalid credentials
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      // Persist custom fields into the JWT on first sign-in
      if (user) {
        token.tier = (user as any).tier ?? "BASIC";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id ?? token.sub;
        session.user.tier = token.tier ?? "ENTERPRISE";
      }
      return session;
    },
  },
  pages: {
    signIn: "/",          // redirect unauthenticated users to our custom login
    error: "/",           // show errors on the login page
  },
  secret: process.env.NEXTAUTH_SECRET || "default_local_secret_for_kedaiio",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
