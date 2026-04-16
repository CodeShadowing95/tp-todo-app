import { ItemDto } from '../dto/item.dto';

const isTestEnv = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

const memory = new Map<string, ItemDto>();

type DrizzleInstance = {
    db: any;
    todoItems: any;
    eq: any;
};

let drizzleInstance: DrizzleInstance | null = null;

async function getDrizzleInstance(): Promise<DrizzleInstance> {
    if (drizzleInstance) return drizzleInstance;

    const [{ db, todoItems }, { eq }] = await Promise.all([
        import('db'),
        import('drizzle-orm'),
    ]);

    drizzleInstance = { db, todoItems, eq };
    return drizzleInstance;
}

export async function init(): Promise<void> {
    if (isTestEnv) {
        memory.clear();
        return;
    }
}

export async function teardown(): Promise<void> {
    if (isTestEnv) {
        memory.clear();
        return;
    }
}

export async function getItems(): Promise<ItemDto[]> {
    if (isTestEnv) {
        return Array.from(memory.values());
    }

    const { db, todoItems } = await getDrizzleInstance();
    const rows = await db
        .select({
            id: todoItems.id,
            name: todoItems.name,
            completed: todoItems.completed,
        })
        .from(todoItems);
    return rows as ItemDto[];
}

export async function getItem(id: string): Promise<ItemDto | null> {
    if (isTestEnv) {
        return memory.get(id) ?? null;
    }

    const { db, todoItems, eq } = await getDrizzleInstance();
    const rows = await db
        .select({
            id: todoItems.id,
            name: todoItems.name,
            completed: todoItems.completed,
        })
        .from(todoItems)
        .where(eq(todoItems.id, id))
        .limit(1);
    return (rows[0] as ItemDto | undefined) ?? null;
}

export async function storeItem(item: ItemDto): Promise<void> {
    if (!item.id) {
        throw new Error('Item id is required');
    }
    const completed = item.completed ?? false;

    if (isTestEnv) {
        memory.set(item.id, { ...item, completed });
        return;
    }

    const { db, todoItems } = await getDrizzleInstance();
    await db.insert(todoItems).values({
        id: item.id,
        name: item.name,
        completed,
    });
}

export async function updateItem(id: string, item: ItemDto): Promise<void> {
    const completed = item.completed ?? false;

    if (isTestEnv) {
        if (!memory.has(id)) return;
        memory.set(id, { ...item, id, completed });
        return;
    }

    const { db, todoItems, eq } = await getDrizzleInstance();
    await db
        .update(todoItems)
        .set({
            name: item.name,
            completed,
            updatedAt: new Date(),
        })
        .where(eq(todoItems.id, id));
}

export async function removeItem(id: string): Promise<void> {
    if (isTestEnv) {
        memory.delete(id);
        return;
    }

    const { db, todoItems, eq } = await getDrizzleInstance();
    await db.delete(todoItems).where(eq(todoItems.id, id));
}
