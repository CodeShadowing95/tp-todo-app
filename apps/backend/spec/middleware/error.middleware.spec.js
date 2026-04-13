const errorHandler = require('../../src/middleware/error.middleware');

describe('Error Handling Middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
        // Suppress console.error during tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('should handle Item not found error and return 404', () => {
        const error = new Error('Item not found');

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                message: 'Item not found',
            },
        });
    });

    it('should handle Name is required error and return 400', () => {
        const error = new Error('Name is required');

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                message: 'Name is required',
            },
        });
    });

    it('should handle generic errors and return 500', () => {
        const error = new Error('Database connection failed');

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                message: 'Internal Server Error',
            },
        });
        expect(console.error).toHaveBeenCalledWith(
            '[Error] Database connection failed',
        );
    });
});
