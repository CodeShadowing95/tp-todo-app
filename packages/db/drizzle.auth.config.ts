import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: '../../.env' })

export default defineConfig({
  schema: './src/schemas/auth.ts',
  out: './drizzle-auth',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.AUTH_DATABASE_URL ??
      'postgres://user:password@localhost:5432/postgres',
  },
})
