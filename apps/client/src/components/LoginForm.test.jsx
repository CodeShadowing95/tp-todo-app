import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import * as api from '../api';

function flushPromises() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

function getButtonByText(container, label) {
    return [...container.querySelectorAll('button')].find(
        (button) => button.textContent?.trim() === label,
    );
}

function setInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
    )?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('LoginForm', () => {
    let container;
    let root;

    beforeEach(() => {
        vi.restoreAllMocks();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => {
            root.unmount();
        });
        container.remove();
    });

    it('submits login credentials, stores the token and calls onAuth', async () => {
        const onAuth = vi.fn();
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({
                token: 'jwt-token',
                user: { id: '1', email: 'john@example.com' },
            }),
        });
        const setTokenSpy = vi.spyOn(api, 'setToken');

        await act(async () => {
            root.render(<LoginForm onAuth={onAuth} />);
        });

        const emailInput = container.querySelector(
            'input[placeholder="email@example.com"]',
        );
        const passwordInput = container.querySelector(
            'input[placeholder="Password"]',
        );
        const submitButton = getButtonByText(container, 'Login');

        await act(async () => {
            setInputValue(emailInput, 'john@example.com');
            setInputValue(passwordInput, 'Password1');
        });

        await act(async () => {
            submitButton.click();
            await flushPromises();
        });

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/auth/login',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'john@example.com',
                    password: 'Password1',
                }),
            }),
        );
        expect(setTokenSpy).toHaveBeenCalledWith('jwt-token');
        expect(onAuth).toHaveBeenCalledTimes(1);
    });

    it('shows the backend error message when auth fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            json: async () => ({
                error: { message: 'Invalid credentials' },
            }),
        });

        await act(async () => {
            root.render(<LoginForm onAuth={vi.fn()} />);
        });

        const emailInput = container.querySelector(
            'input[placeholder="email@example.com"]',
        );
        const passwordInput = container.querySelector(
            'input[placeholder="Password"]',
        );
        const submitButton = getButtonByText(container, 'Login');

        await act(async () => {
            setInputValue(emailInput, 'john@example.com');
            setInputValue(passwordInput, 'wrongpass');
        });

        await act(async () => {
            submitButton.click();
            await flushPromises();
        });

        expect(container.textContent).toContain('Invalid credentials');
    });
});
