import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware, {
    AuthRequest,
} from '../../src/middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

describe('Auth Middleware', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;
    let next: jest.Mock<NextFunction>;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 401 when no Authorization header', () => {
        authMiddleware(req as AuthRequest, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: { message: 'Token missing' },
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when header does not start with Bearer', () => {
        req.headers = { authorization: 'Basic abc' };

        authMiddleware(req as AuthRequest, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: { message: 'Token missing' },
        });
    });

    it('should return 401 when token is invalid', () => {
        req.headers = { authorization: 'Bearer invalid-token' };

        authMiddleware(req as AuthRequest, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: { message: 'Invalid token' },
        });
    });

    it('should call next and set userId for a valid token', () => {
        const token = jwt.sign({ userId: 'user-123' }, JWT_SECRET);
        req.headers = { authorization: `Bearer ${token}` };

        authMiddleware(req as AuthRequest, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(req.userId).toBe('user-123');
        expect(res.status).not.toHaveBeenCalled();
    });
});
