import Credentials from 'next-auth/providers/credentials';
import { getDb, schema } from '@/lib/db/client';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const credentialsProvider = Credentials({
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null;
    }

    const email = credentials.email as string;
    const password = credentials.password as string;

    const db = getDb();
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});
