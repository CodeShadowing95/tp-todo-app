const itemController = require('../../src/controllers/item.controller');
const itemService = require('../../src/services/item.service');

jest.mock('../../src/services/item.service');

describe('ItemController', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
        };
        res = {
            send: jest.fn(),
            sendStatus: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getItems', () => {
        it('should return all items', async () => {
            const items = [{ id: 1, name: 'Test Item' }];
            itemService.getAllItems.mockResolvedValue(items);

            await itemController.getItems(req, res);

            expect(itemService.getAllItems).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith(items);
        });

        it('should throw error on failure', async () => {
            const error = new Error('DB Error');
            itemService.getAllItems.mockRejectedValue(error);

            await expect(itemController.getItems(req, res)).rejects.toThrow(
                'DB Error',
            );
        });
    });

    describe('addItem', () => {
        it('should add an item and return it', async () => {
            req.body.name = 'New Item';
            const newItem = { id: 1, name: 'New Item', completed: false };
            itemService.createItem.mockResolvedValue(newItem);

            await itemController.addItem(req, res);

            expect(itemService.createItem).toHaveBeenCalledWith('New Item');
            expect(res.send).toHaveBeenCalledWith(newItem);
        });
    });

    describe('updateItem', () => {
        it('should update an item and return it', async () => {
            req.params.id = 1;
            req.body = { name: 'Updated Item', completed: true };
            const updatedItem = {
                id: 1,
                name: 'Updated Item',
                completed: true,
            };

            itemService.updateItem.mockResolvedValue(updatedItem);

            await itemController.updateItem(req, res);

            expect(itemService.updateItem).toHaveBeenCalledWith(1, req.body);
            expect(res.send).toHaveBeenCalledWith(updatedItem);
        });
    });

    describe('deleteItem', () => {
        it('should delete an item and return 200', async () => {
            req.params.id = 1;
            itemService.deleteItem.mockResolvedValue();

            await itemController.deleteItem(req, res);

            expect(itemService.deleteItem).toHaveBeenCalledWith(1);
            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
    });
});
