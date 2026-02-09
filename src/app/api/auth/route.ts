import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Mock user authentication
        if (
          credentials?.email === "member@example.com" &&
          credentials?.password === "password123"
        ) {
          return { id: "1", name: "Member User", email: "member@example.com", role: "member" };
        }
        if (
          credentials?.email === "visitor@example.com" &&
          credentials?.password === "visitorpass"
        ) {
          return { id: "2", name: "Visitor User", email: "visitor@example.com", role: "visitor" };
        }
        // Return null if user data is invalid
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if ("role" in user) {
          token.role = (user as { role?: string }).role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
