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

type DrizzleClient = ReturnType<typeof createDb>

function createLazyDbProxy(getClient: () => DrizzleClient) {
  return new Proxy({} as DrizzleClient, {
    get(_target, prop, receiver) {
      const client = getClient()
      const value = Reflect.get(client as object, prop, receiver)
      return typeof value === 'function' ? value.bind(client) : value
    },
  })
}

let dbInstance: DrizzleClient | null = null
let authDbInstance: DrizzleClient | null = null

function getTodoDb() {
  if (!dbInstance) {
    const todoDatabaseUrl = getDatabaseUrl(
      'DATABASE_URL',
      isTestEnv ? defaultTestDatabaseUrl : undefined,
    )
    dbInstance = createDb(todoDatabaseUrl, todoSchema)
  }

  return dbInstance
}

function getAuthDb() {
  if (!authDbInstance) {
    const authDatabaseUrl = getDatabaseUrl(
      'AUTH_DATABASE_URL',
      isTestEnv ? getDatabaseUrl('DATABASE_URL', defaultTestDatabaseUrl) : undefined,
    )
    authDbInstance = createDb(authDatabaseUrl, authSchema)
  }

  return authDbInstance
}

export const db = createLazyDbProxy(getTodoDb)
export const authDb = createLazyDbProxy(getAuthDb)

export type DB = typeof db
export type AuthDB = typeof authDb
