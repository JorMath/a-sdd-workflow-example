import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, createUser, cleanupUsers, type UserRole } from '../helpers/seed';
import { type TestDb } from '../helpers/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Database Integration', () => {
  let db: TestDb;

  beforeEach(async () => {
    db = await createTestDatabase();
  });

  afterEach(async () => {
    if (db) {
      await cleanupUsers(db);
    }
  });

  describe('User CRUD', () => {
    it('should create a user and query it back', async () => {
      const createdUser = await createUser(db, {
        email: 'test@example.com',
        name: 'Test User',
        role: 'jugador',
      });

      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toBe('test@example.com');
      expect(createdUser.name).toBe('Test User');
      expect(createdUser.role).toBe('jugador');
    });

    it('should query all users', async () => {
      await createUser(db, { email: 'user1@test.com', name: 'User One' });
      await createUser(db, { email: 'user2@test.com', name: 'User Two' });
      await createUser(db, { email: 'user3@test.com', name: 'User Three' });

      const allUsers = await db.select().from(users);

      expect(allUsers).toHaveLength(3);
    });

    it('should update a user', async () => {
      const created = await createUser(db, { name: 'Original Name' });
      const userId = created.id as string;

      const [updated] = await db
        .update(users)
        .set({ name: 'Updated Name' })
        .where(eq(users.id, userId))
        .returning();

      expect(updated.name).toBe('Updated Name');
    });

    it('should delete a user', async () => {
      const created = await createUser(db, { email: 'delete@test.com' });
      const userId = created.id as string;

      await db.delete(users).where(eq(users.id, userId));

      const [found] = await db.select().from(users).where(eq(users.id, userId));
      expect(found).toBeUndefined();
    });

    it('should enforce unique email constraint', async () => {
      const email = 'duplicate@test.com';
      await createUser(db, { email });

      await expect(
        createUser(db, { email })
      ).rejects.toThrow();
    });

    it('should support different user roles', async () => {
      const roles: UserRole[] = ['super_admin', 'admin_torneo', 'arbitro', 'capitan', 'jugador'];

      for (const role of roles) {
        const user = await createUser(db, { role, email: `${role}@test.com` });
        expect(user.role).toBe(role);
      }

      const allUsers = await db.select().from(users);
      expect(allUsers).toHaveLength(5);
    });

    it('should handle inactive users', async () => {
      const inactiveUser = await createUser(db, { isActive: false, email: 'inactive@test.com' });
      expect(inactiveUser.isActive).toBe(false);

      const activeUsers = await db.select().from(users).where(eq(users.isActive, true));
      expect(activeUsers).toHaveLength(0);
    });
  });
});
