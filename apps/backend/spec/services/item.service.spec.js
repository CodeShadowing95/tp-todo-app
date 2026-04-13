const itemService = require('../../src/services/item.service');
const itemRepository = require('../../src/repositories/item.repository');
const { v4: uuid } = require('uuid');

jest.mock('../../src/repositories/item.repository');
jest.mock('uuid');

describe('ItemService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createItem', () => {
        it('should create an item with a generated uuid and default completed false', async () => {
            const fakeId = '123e4567-e89b-12d3-a456-426614174000';
            uuid.mockReturnValue(fakeId);

            const expectedItem = {
                id: fakeId,
                name: 'Test Task',
                completed: false,
            };

            itemRepository.createItem.mockResolvedValue(expectedItem);

            const result = await itemService.createItem('Test Task');

            expect(uuid).toHaveBeenCalledTimes(1);
            expect(itemRepository.createItem).toHaveBeenCalledWith(
                expectedItem,
            );
            expect(result).toEqual(expectedItem);
        });

        it('should throw an error if name is missing', async () => {
            await expect(itemService.createItem('')).rejects.toThrow(
                'Name is required',
            );
        });
    });

    describe('getItemById', () => {
        it('should return item if it exists', async () => {
            const mockItem = { id: 1, name: 'Test' };
            itemRepository.getItemById.mockResolvedValue(mockItem);

            const result = await itemService.getItemById(1);

            expect(result).toEqual(mockItem);
        });

        it('should throw an error if item is not found', async () => {
            itemRepository.getItemById.mockResolvedValue(null);

            await expect(itemService.getItemById(1)).rejects.toThrow(
                'Item not found',
            );
        });
    });

    describe('updateItem', () => {
        it('should update item if it exists', async () => {
            const mockItem = { id: 1, name: 'Test' };
            itemRepository.getItemById.mockResolvedValue(mockItem);

            const updatedData = { name: 'Updated' };
            const expectedUpdatedItem = { id: 1, name: 'Updated' };
            itemRepository.updateItem.mockResolvedValue(expectedUpdatedItem);

            const result = await itemService.updateItem(1, updatedData);

            expect(itemRepository.getItemById).toHaveBeenCalledWith(1);
            expect(itemRepository.updateItem).toHaveBeenCalledWith(
                1,
                updatedData,
            );
            expect(result).toEqual(expectedUpdatedItem);
        });

        it('should throw error if updating non-existent item', async () => {
            itemRepository.getItemById.mockResolvedValue(null);

            await expect(itemService.updateItem(1, {})).rejects.toThrow(
                'Item not found',
            );
            expect(itemRepository.updateItem).not.toHaveBeenCalled();
        });
    });

    describe('deleteItem', () => {
        it('should delete item if it exists', async () => {
            const mockItem = { id: 1, name: 'Test' };
            itemRepository.getItemById.mockResolvedValue(mockItem);

            await itemService.deleteItem(1);

            expect(itemRepository.getItemById).toHaveBeenCalledWith(1);
            expect(itemRepository.deleteItem).toHaveBeenCalledWith(1);
        });

        it('should throw error if deleting non-existent item', async () => {
            itemRepository.getItemById.mockResolvedValue(null);

            await expect(itemService.deleteItem(1)).rejects.toThrow(
                'Item not found',
            );
            expect(itemRepository.deleteItem).not.toHaveBeenCalled();
        });
    });
});
