import { NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { registerServerSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const parsed = registerServerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name, cedula } = parsed.data;

    const db = getDb();

    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(schema.users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'jugador',
        cedula: cedula || null,
        isActive: true,
      })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        role: schema.users.role,
      });

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
