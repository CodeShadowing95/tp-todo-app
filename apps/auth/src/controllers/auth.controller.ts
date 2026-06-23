import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authDb, users } from 'db';
import { eq } from 'drizzle-orm';
import { deleteCachedKeys, getCachedJson, setCachedJson } from '../utils/cache';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const USER_CACHE_TTL_SECONDS = 300;

type CachedUser = {
    id: string;
    email: string;
    passwordHash: string;
};

function signToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

function getUserCacheKey(email: string): string {
    return `auth:user:${email.trim().toLowerCase()}`;
}

class AuthController {
    async register(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                error: { message: 'Email and password are required' },
            });
            return;
        }

        const cacheKey = getUserCacheKey(email);
        const cachedUser = await getCachedJson<CachedUser>(cacheKey);
        const existing =
            cachedUser ??
            (
                await authDb
                    .select({
                        id: users.id,
                        email: users.email,
                        passwordHash: users.passwordHash,
                    })
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1)
            )[0];

        if (existing) {
            res.status(409).json({
                error: { message: 'Email already registered' },
            });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const rows = await authDb
            .insert(users)
            .values({ email, passwordHash })
            .returning();
        const user = rows[0];

        await setCachedJson(cacheKey, user, USER_CACHE_TTL_SECONDS);

        const token = signToken(user.id);
        res.status(201).json({
            token,
            user: { id: user.id, email: user.email },
        });
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                error: { message: 'Email and password are required' },
            });
            return;
        }

        const cacheKey = getUserCacheKey(email);
        const cachedUser = await getCachedJson<CachedUser>(cacheKey);
        const user =
            cachedUser ??
            (
                await authDb
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1)
            )[0];

        if (!user) {
            res.status(401).json({
                error: { message: 'Invalid credentials' },
            });
            return;
        }

        if (!cachedUser) {
            await setCachedJson(cacheKey, user, USER_CACHE_TTL_SECONDS);
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            await deleteCachedKeys(cacheKey);
            res.status(401).json({
                error: { message: 'Invalid credentials' },
            });
            return;
        }

        const token = signToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email } });
    }
}

export default new AuthController();
