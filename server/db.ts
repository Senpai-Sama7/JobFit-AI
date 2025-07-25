import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Cast pool to any to satisfy drizzle's NodePgClient type
export const db = drizzle(pool as any, { schema });
