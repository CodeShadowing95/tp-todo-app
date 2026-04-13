const itemRepository = require('../repositories/item.repository');
const { v4: uuid } = require('uuid');

class ItemService {
    async getAllItems() {
        return await itemRepository.getItems();
    }

    async getItemById(id) {
        const item = await itemRepository.getItemById(id);
        if (!item) {
            throw new Error('Item not found');
        }
        return item;
    }

    async createItem(name) {
        if (!name) {
            throw new Error('Name is required');
        }

        const item = {
            id: uuid(),
            name: name,
            completed: false,
        };

        return await itemRepository.createItem(item);
    }

    async updateItem(id, itemData) {
        await this.getItemById(id);

        return await itemRepository.updateItem(id, itemData);
    }

    async deleteItem(id) {
        await this.getItemById(id);

        await itemRepository.deleteItem(id);
    }
}

module.exports = new ItemService();
