import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

class AuthStorage {
  async initTables() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await pool.query(
      'SELECT id, email, first_name as "firstName", last_name as "lastName", profile_image_url as "profileImageUrl", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await pool.query(`
      INSERT INTO users (id, email, first_name, last_name, profile_image_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        profile_image_url = EXCLUDED.profile_image_url,
        updated_at = NOW()
      RETURNING id, email, first_name as "firstName", last_name as "lastName", profile_image_url as "profileImageUrl", created_at as "createdAt", updated_at as "updatedAt"
    `, [userData.id, userData.email, userData.firstName, userData.lastName, userData.profileImageUrl]);
    return result.rows[0];
  }
}

export const authStorage = new AuthStorage();
