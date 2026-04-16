import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export interface AuthRequest extends Request {
    userId?: string;
}

const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ error: { message: 'Token missing' } });
        return;
    }

    try {
        const token = header.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = payload.userId;
        next();
    } catch {
        res.status(401).json({ error: { message: 'Invalid token' } });
    }
};

export default authMiddleware;
