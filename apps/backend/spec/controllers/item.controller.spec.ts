import type { Request, Response } from 'express';
import ItemController from '../../src/controllers/item.controller';
import ItemService from '../../src/services/item.service';

describe('ItemController', () => {
    let req: Request;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
        } as unknown as Request;
        res = {
            send: jest.fn(),
            sendStatus: jest.fn(),
        };
        jest.restoreAllMocks();
    });

    describe('getItems', () => {
        it('should return all items', async () => {
            const items = [{ id: '1', name: 'Test Item', completed: false }];
            jest.spyOn(ItemService, 'getAllItems').mockResolvedValue(items);

            await ItemController.getItems(req, res as Response);

            expect(ItemService.getAllItems).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith(items);
        });

        it('should throw error on failure', async () => {
            const error = new Error('DB Error');
            jest.spyOn(ItemService, 'getAllItems').mockRejectedValue(error);

            await expect(
                ItemController.getItems(req, res as Response),
            ).rejects.toThrow('DB Error');
        });
    });

    describe('addItem', () => {
        it('should add an item and return it', async () => {
            req.body.name = 'New Item';
            const newItem = { id: '1', name: 'New Item', completed: false };
            jest.spyOn(ItemService, 'createItem').mockResolvedValue(newItem);

            await ItemController.addItem(req, res as Response);

            expect(ItemService.createItem).toHaveBeenCalledWith('New Item');
            expect(res.send).toHaveBeenCalledWith(newItem);
        });
    });

    describe('updateItem', () => {
        it('should update an item and return it', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Item', completed: true };
            const updatedItem = {
                id: '1',
                name: 'Updated Item',
                completed: true,
            };

            jest.spyOn(ItemService, 'updateItem').mockResolvedValue(
                updatedItem,
            );

            await ItemController.updateItem(req, res as Response);

            expect(ItemService.updateItem).toHaveBeenCalledWith('1', req.body);
            expect(res.send).toHaveBeenCalledWith(updatedItem);
        });
    });

    describe('deleteItem', () => {
        it('should delete an item and return 200', async () => {
            req.params.id = '1';
            jest.spyOn(ItemService, 'deleteItem').mockResolvedValue();

            await ItemController.deleteItem(req, res as Response);

            expect(ItemService.deleteItem).toHaveBeenCalledWith('1');
            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
    });
});
