import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as authSchemaDefinitions from './schemas/auth'
import * as todoSchemaDefinitions from './schemas/todo'

const todoSchema = {
  ...todoSchemaDefinitions,
}

const authSchema = {
  ...authSchemaDefinitions,
}

const isTestEnv = process.env.APP_ENV === 'test' || Boolean(process.env.JEST_WORKER_ID)
const defaultTestDatabaseUrl = 'postgres://user:password@localhost:5432/batipilote_test'

function getDatabaseUrl(
  envName: 'DATABASE_URL' | 'AUTH_DATABASE_URL',
  fallback?: string,
) {
  const databaseUrl = process.env[envName] ?? fallback

  if (!databaseUrl) {
    throw new Error(`${envName} environment variable is not set`)
  }

  return databaseUrl
}

function createDb(
  databaseUrl: string,
  schema: typeof todoSchema | typeof authSchema,
) {
  const dbUrl = new URL(databaseUrl)
  const host = dbUrl.hostname || ''
  const isNeon = host.includes('neon.tech')

  if (isNeon) {
    const sql = neon(databaseUrl)
    return drizzleNeon(sql, { schema })
  }

  const useSSL = process.env.DATABASE_SSL === 'true' || process.env.PGSSLMODE === 'require'
  const sql = postgres(databaseUrl, {
    ssl: useSSL
      ? process.env.APP_ENV === 'development'
        ? { rejectUnauthorized: false }
        : true
      : false,
    max: 10,
  })
  return drizzlePostgres(sql, { schema })
}

const todoDatabaseUrl = getDatabaseUrl(
  'DATABASE_URL',
  isTestEnv ? defaultTestDatabaseUrl : undefined,
)

const authDatabaseUrl = getDatabaseUrl(
  'AUTH_DATABASE_URL',
  isTestEnv ? todoDatabaseUrl : undefined,
)

export const db = createDb(todoDatabaseUrl, todoSchema)
export const authDb = createDb(authDatabaseUrl, authSchema)

export type DB = typeof db
export type AuthDB = typeof authDb
