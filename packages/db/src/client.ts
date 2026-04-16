import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as authSchema from './schemas/auth'
import * as todoSchema from './schemas/todo'

const schema = {
  ...authSchema,
  ...todoSchema,
}

const databaseUrl =
  process.env.DATABASE_URL ??
  (process.env.APP_ENV === 'test' || process.env.JEST_WORKER_ID
    ? 'postgres://user:password@localhost:5432/batipilote_test'
    : undefined)

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Auto-detect driver: Neon HTTP for *.neon.tech URLs, postgres-js for everything else (Docker, local PG)
const dbUrl = new URL(databaseUrl)
const host = dbUrl.hostname || ''
const isNeon = host.includes('neon.tech')

function createDb() {
  // databaseUrl is guaranteed non-null here (guarded by the throw above)
  const url = databaseUrl as string

  if (isNeon) {
    const sql = neon(url)
    return drizzleNeon(sql, { schema })
  }

  const useSSL = process.env.DATABASE_SSL === 'true' || process.env.PGSSLMODE === 'require'
  const sql = postgres(url, {
    ssl: useSSL
      ? process.env.APP_ENV === 'development'
        ? { rejectUnauthorized: false }
        : true
      : false,
    max: 10,
  })
  return drizzlePostgres(sql, { schema })
}

export const db = createDb()

export type DB = typeof db
