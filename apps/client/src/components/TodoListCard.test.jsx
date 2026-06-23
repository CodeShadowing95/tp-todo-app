import { act } from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoListCard } from './TodoListCard';

const apiFetchMock = vi.fn();

vi.mock('../api', () => ({
    apiFetch: (...args) => apiFetchMock(...args),
}));

vi.mock('./AddNewItemForm', () => ({
    AddItemForm: Object.assign(
        function MockAddItemForm({ onNewItem }) {
            return (
                <button
                    type="button"
                    onClick={() =>
                        onNewItem({
                            id: 'added-item',
                            name: 'Added item',
                            completed: false,
                        })
                    }
                >
                    Trigger Add
                </button>
            );
        },
        {
            propTypes: {
                onNewItem: PropTypes.func,
            },
        },
    ),
}));

vi.mock('./ItemDisplay', () => ({
    ItemDisplay: Object.assign(
        function MockItemDisplay({ item, onItemRemoval }) {
            return (
                <div data-testid={`item-${item.id}`}>
                    <span>{item.name}</span>
                    <button type="button" onClick={() => onItemRemoval(item)}>
                        Remove {item.name}
                    </button>
                </div>
            );
        },
        {
            propTypes: {
                item: PropTypes.shape({
                    id: PropTypes.string,
                    name: PropTypes.string,
                }),
                onItemRemoval: PropTypes.func,
            },
        },
    ),
}));

function flushPromises() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('TodoListCard', () => {
    let container;
    let root;

    beforeEach(() => {
        apiFetchMock.mockReset();
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

    it('shows the loading state before rendering the initial items', async () => {
        let resolveRequest;
        apiFetchMock.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveRequest = resolve;
            }),
        );

        await act(async () => {
            root.render(<TodoListCard />);
        });

        expect(container.textContent).toContain('Loading...');

        await act(async () => {
            resolveRequest({
                json: async () => [
                    { id: 'item-1', name: 'First item', completed: false },
                ],
            });
            await flushPromises();
        });

        expect(apiFetchMock).toHaveBeenCalledWith('/api/items');
        expect(container.textContent).toContain('First item');
        expect(container.textContent).not.toContain('Loading...');
    });

    it('adds and removes items after the initial load', async () => {
        apiFetchMock.mockResolvedValueOnce({
            json: async () => [
                { id: 'item-1', name: 'Initial item', completed: false },
            ],
        });

        await act(async () => {
            root.render(<TodoListCard />);
            await flushPromises();
        });

        expect(container.textContent).toContain('Initial item');

        const addButton = [...container.querySelectorAll('button')].find(
            (button) => button.textContent === 'Trigger Add',
        );

        await act(async () => {
            addButton.click();
        });

        expect(container.textContent).toContain('Added item');

        const removeAddedButton = [
            ...container.querySelectorAll('button'),
        ].find((button) => button.textContent === 'Remove Added item');

        await act(async () => {
            removeAddedButton.click();
        });

        expect(container.textContent).toContain('Initial item');
        expect(container.textContent).not.toContain('Added item');
    });
});
