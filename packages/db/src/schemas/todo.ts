import { boolean, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const todoItems = pgTable(
  'todo_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    completed: boolean('completed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameIdx: index('todo_items_name_idx').on(table.name),
    completedIdx: index('todo_items_completed_idx').on(table.completed),
  }),
)

export type TodoItem = typeof todoItems.$inferSelect
export type NewTodoItem = typeof todoItems.$inferInsert
