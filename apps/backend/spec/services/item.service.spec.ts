import ItemService from '../../src/services/item.service';
import itemRepository from '../../src/repositories/item.repository';
import { v4 as uuid } from 'uuid';

jest.mock('../../src/repositories/item.repository', () => ({
    __esModule: true,
    default: {
        getItems: jest.fn(),
        getItemById: jest.fn(),
        createItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
    },
}));

jest.mock('uuid', () => ({ v4: jest.fn() }));

describe('ItemService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createItem', () => {
        it('should create an item with a generated uuid and default completed false', async () => {
            const fakeId = '123e4567-e89b-12d3-a456-426614174000';
            (uuid as unknown as jest.Mock).mockReturnValue(fakeId);

            const expectedItem = {
                id: fakeId,
                name: 'Test Task',
                completed: false,
            };

            (
                itemRepository.createItem as unknown as jest.Mock
            ).mockResolvedValue(expectedItem);

            const result = await ItemService.createItem('Test Task');

            expect(uuid).toHaveBeenCalledTimes(1);
            expect(itemRepository.createItem).toHaveBeenCalledWith(
                expectedItem,
            );
            expect(result).toEqual(expectedItem);
        });

        it('should throw an error if name is missing', async () => {
            await expect(ItemService.createItem('')).rejects.toThrow(
                'Name is required',
            );
        });
    });

    describe('getItemById', () => {
        it('should return item if it exists', async () => {
            const mockItem = { id: 1, name: 'Test' };
            (
                itemRepository.getItemById as unknown as jest.Mock
            ).mockResolvedValue(mockItem);

            const result = await ItemService.getItemById('1');

            expect(result).toEqual(mockItem);
        });

        it('should throw an error if item is not found', async () => {
            (
                itemRepository.getItemById as unknown as jest.Mock
            ).mockResolvedValue(null);

            await expect(ItemService.getItemById('1')).rejects.toThrow(
                'Item not found',
            );
        });
    });

    describe('updateItem', () => {
        it('should update item if it exists', async () => {
            const mockItem = { id: 1, name: 'Test' };
            (
                itemRepository.getItemById as unknown as jest.Mock
            ).mockResolvedValue(mockItem);

            const updatedData = { name: 'Updated' };
            const expectedUpdatedItem = { id: 1, name: 'Updated' };
            (
                itemRepository.updateItem as unknown as jest.Mock
            ).mockResolvedValue(expectedUpdatedItem);

            const result = await ItemService.updateItem(
                '1',
                updatedData as any,
            );

            expect(itemRepository.getItemById).toHaveBeenCalledWith('1');
            expect(itemRepository.updateItem).toHaveBeenCalledWith(
                '1',
                updatedData,
            );
            expect(result).toEqual(expectedUpdatedItem);
        });

        it('should throw error if updating non-existent item', async () => {
            (
                itemRepository.getItemById as unknown as jest.Mock
            ).mockResolvedValue(null);

            await expect(
                ItemService.updateItem('1', {} as any),
            ).rejects.toThrow('Item not found');
            expect(itemRepository.updateItem).not.toHaveBeenCalled();
        });
    });

    describe('deleteItem', () => {
        it('should delete item if it exists', async () => {
            const mockItem = { id: 1, name: 'Test' };
            (
                itemRepository.getItemById as unknown as jest.Mock
            ).mockResolvedValue(mockItem);

            await ItemService.deleteItem('1');

            expect(itemRepository.getItemById).toHaveBeenCalledWith('1');
            expect(itemRepository.deleteItem).toHaveBeenCalledWith('1');
        });

        it('should throw error if deleting non-existent item', async () => {
            (
                itemRepository.getItemById as unknown as jest.Mock
            ).mockResolvedValue(null);

            await expect(ItemService.deleteItem('1')).rejects.toThrow(
                'Item not found',
            );
            expect(itemRepository.deleteItem).not.toHaveBeenCalled();
        });
    });
});
