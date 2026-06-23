import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, getToken, removeToken, setToken } from './api';

describe('api helpers', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('stores and retrieves the auth token', () => {
        setToken('abc123');

        expect(getToken()).toBe('abc123');

        removeToken();

        expect(getToken()).toBeNull();
    });

    it('adds the bearer token to apiFetch requests', async () => {
        setToken('secret-token');
        const fetchMock = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValue({ status: 200 });

        await apiFetch('/api/items', { method: 'GET' });

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/items',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer secret-token',
                }),
            }),
        );
    });

    it('clears the token and reloads the page on 401 responses', async () => {
        setToken('stale-token');
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({ status: 401 });
        const reloadMock = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: reloadMock },
        });

        await apiFetch('/api/items');

        expect(getToken()).toBeNull();
        expect(reloadMock).toHaveBeenCalledTimes(1);
    });
});
