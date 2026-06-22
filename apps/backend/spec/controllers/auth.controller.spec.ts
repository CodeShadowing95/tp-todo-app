import type { Request, Response } from 'express';

// ── Mocks ──────────────────────────────────────────────────────────
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockInsert = jest.fn();
const mockValues = jest.fn();
const mockReturning = jest.fn();

jest.mock('db', () => ({
    authDb: {
        select: (...args: unknown[]) => {
            mockSelect(...args);
            return { from: mockFrom };
        },
        insert: (...args: unknown[]) => {
            mockInsert(...args);
            return { values: mockValues };
        },
    },
    users: { id: 'id', email: 'email', passwordHash: 'password_hash' },
}));

jest.mock('drizzle-orm', () => ({
    eq: jest.fn((_col: unknown, val: unknown) => ({ _col, val })),
}));

jest.mock('bcryptjs', () => ({
    __esModule: true,
    default: {
        hash: jest.fn(),
        compare: jest.fn(),
    },
}));

jest.mock('jsonwebtoken', () => ({
    __esModule: true,
    default: {
        sign: jest.fn().mockReturnValue('mock-token'),
    },
}));

import bcrypt from 'bcryptjs';
import AuthController from '../../src/controllers/auth.controller';

// ── Helpers ────────────────────────────────────────────────────────
function makeReqRes(body: Record<string, unknown> = {}) {
    const req = { body } as unknown as Request;
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
    return { req, res };
}

// Chain: select().from().where().limit()
function setupSelectChain(result: unknown[]) {
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue(result);
}

// Chain: insert().values().returning()
function setupInsertChain(result: unknown[]) {
    mockValues.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue(result);
}

// ── Tests ──────────────────────────────────────────────────────────
describe('AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── register ───────────────────────────────────────────────────
    describe('register', () => {
        it('should return 400 when email or password is missing', async () => {
            const { req, res } = makeReqRes({});

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: { message: 'Email and password are required' },
            });
        });

        it('should return 409 when email already exists', async () => {
            setupSelectChain([{ id: 'existing-id' }]);

            const { req, res } = makeReqRes({
                email: 'dup@test.com',
                password: 'pass123',
            });

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                error: { message: 'Email already registered' },
            });
        });

        it('should create user and return 201 with token', async () => {
            setupSelectChain([]);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');

            const newUser = {
                id: 'new-id',
                email: 'new@test.com',
                passwordHash: 'hashed-pw',
                createdAt: new Date(),
            };
            setupInsertChain([newUser]);

            const { req, res } = makeReqRes({
                email: 'new@test.com',
                password: 'pass123',
            });

            await AuthController.register(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                token: 'mock-token',
                user: { id: 'new-id', email: 'new@test.com' },
            });
        });
    });

    // ── login ──────────────────────────────────────────────────────
    describe('login', () => {
        it('should return 400 when email or password is missing', async () => {
            const { req, res } = makeReqRes({ email: 'only@email.com' });

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 401 when user is not found', async () => {
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });
            mockLimit.mockResolvedValue([]);

            const { req, res } = makeReqRes({
                email: 'nope@test.com',
                password: 'pass123',
            });

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: { message: 'Invalid credentials' },
            });
        });

        it('should return 401 when password is wrong', async () => {
            const existingUser = {
                id: 'u1',
                email: 'user@test.com',
                passwordHash: 'hashed',
            };
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });
            mockLimit.mockResolvedValue([existingUser]);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const { req, res } = makeReqRes({
                email: 'user@test.com',
                password: 'wrong',
            });

            await AuthController.login(req, res);

            expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return token on valid credentials', async () => {
            const existingUser = {
                id: 'u1',
                email: 'user@test.com',
                passwordHash: 'hashed',
            };
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });
            mockLimit.mockResolvedValue([existingUser]);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const { req, res } = makeReqRes({
                email: 'user@test.com',
                password: 'correct',
            });

            await AuthController.login(req, res);

            expect(res.json).toHaveBeenCalledWith({
                token: 'mock-token',
                user: { id: 'u1', email: 'user@test.com' },
            });
        });
    });
});
