import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: '../../.env' })

export default defineConfig({
  schema: './src/schemas/todo.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgres://user:password@localhost:5432/postgres',
  },
})
