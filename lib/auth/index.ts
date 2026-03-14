import './types';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { credentialsProvider } from './credentials-provider';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [credentialsProvider],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
