const itemService = require('../services/item.service');

class ItemController {
    async getItems(req, res) {
        const items = await itemService.getAllItems();
        res.send(items);
    }

    async getItem(req, res) {
        const item = await itemService.getItemById(req.params.id);
        res.send(item);
    }

    async addItem(req, res) {
        const item = await itemService.createItem(req.body.name);
        res.send(item);
    }

    async updateItem(req, res) {
        const itemData = {
            name: req.body.name,
            completed: req.body.completed,
        };
        const item = await itemService.updateItem(req.params.id, itemData);
        res.send(item);
    }

    async deleteItem(req, res) {
        await itemService.deleteItem(req.params.id);
        res.sendStatus(200);
    }
}

module.exports = new ItemController();
