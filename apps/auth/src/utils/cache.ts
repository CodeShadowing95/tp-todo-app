import { createClient } from 'redis';
import logger from './logger';

const isCacheEnabled =
    process.env.NODE_ENV !== 'test' && Boolean(process.env.REDIS_URL);

type CacheClient = ReturnType<typeof createClient>;

let clientPromise: Promise<CacheClient | null> | null = null;

async function getClient(): Promise<CacheClient | null> {
    if (!isCacheEnabled) {
        return null;
    }

    if (!clientPromise) {
        const client = createClient({ url: process.env.REDIS_URL });
        client.on('error', (error) => {
            logger.warn('Redis auth cache error', { error });
        });

        clientPromise = client
            .connect()
            .then(() => client)
            .catch((error) => {
                logger.warn('Redis auth cache unavailable', { error });
                clientPromise = null;
                return null;
            });
    }

    return clientPromise;
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
    const client = await getClient();
    if (!client) {
        return null;
    }

    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
}

export async function setCachedJson(
    key: string,
    value: unknown,
    ttlSeconds = 300,
): Promise<void> {
    const client = await getClient();
    if (!client) {
        return;
    }

    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function deleteCachedKeys(...keys: string[]): Promise<void> {
    const client = await getClient();
    if (!client || keys.length === 0) {
        return;
    }

    await client.del(keys);
}
