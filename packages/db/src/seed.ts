import dotenv from 'dotenv'
import path from 'path'

// Load .env BEFORE requiring the db client (DATABASE_URL must be set first)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

// Use require() so the db module is loaded AFTER dotenv has populated process.env
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { db } = require('./client') as typeof import('./client')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { todoItems } = require('./schemas/todo') as typeof import('./schemas/todo')

const SEED_ITEMS = [
  { name: 'Faire les courses', completed: false },
  { name: 'Appeler le médecin', completed: false },
  { name: 'Lire 30 minutes', completed: true },
  { name: 'Préparer la réunion de demain', completed: false },
  { name: 'Envoyer le rapport mensuel', completed: true },
  { name: 'Mettre à jour les dépendances npm', completed: false },
  { name: 'Réviser les PR en attente', completed: false },
  { name: 'Faire une séance de sport', completed: true },
  { name: 'Sauvegarder les fichiers importants', completed: false },
  { name: 'Préparer le déploiement en production', completed: false },
]

async function seed() {
  console.log('🌱 Seeding database with 10 todo items…')

  await db.delete(todoItems)
  console.log('  ✓ Existing todo items cleared')

  const inserted = await db.insert(todoItems).values(SEED_ITEMS).returning()

  console.log(`  ✓ ${inserted.length} todo items inserted:`)
  inserted.forEach((item) => {
    const status = item.completed ? '✅' : '⬜'
    console.log(`    ${status} [${item.id}] ${item.name}`)
  })

  console.log('\n✅ Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
