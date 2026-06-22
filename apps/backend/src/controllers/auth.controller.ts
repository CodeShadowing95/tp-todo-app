import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authDb, users } from 'db';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

function signToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
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

        const existing = await authDb
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existing.length > 0) {
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

        const [user] = await authDb
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            res.status(401).json({
                error: { message: 'Invalid credentials' },
            });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
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
