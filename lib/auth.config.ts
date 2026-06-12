import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Edge-safe Auth.js config used by middleware. Must not import the Drizzle
 * adapter or bcrypt — both pull in code paths that are unsuitable for the
 * Edge runtime when evaluated at the middleware layer.
 */
export default {
  trustHost: true,
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "Consumer";
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      if (!pathname.startsWith("/dashboard")) {
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (pathname.startsWith("/dashboard/admin") && auth.user.role !== "Admin") {
        return Response.redirect(new URL("/dashboard/consumer", request.nextUrl));
      }

      if (pathname.startsWith("/dashboard/analytics") && auth.user.role !== "Admin") {
        return Response.redirect(new URL("/dashboard/consumer", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
