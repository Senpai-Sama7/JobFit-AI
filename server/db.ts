<<<<<<< HEAD
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
=======
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});
>>>>>>> 38e359a (codebase refactor)

export const db = drizzle(pool, { schema });
