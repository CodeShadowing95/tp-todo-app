const db = require('../persistence');

class ItemRepository {
    async getItems() {
        return await db.getItems();
    }

    async getItemById(id) {
        return await db.getItem(id);
    }

    async createItem(item) {
        await db.storeItem(item);
        return item;
    }

    async updateItem(id, itemData) {
        await db.updateItem(id, itemData);
        return await db.getItem(id);
    }

    async deleteItem(id) {
        await db.removeItem(id);
    }
}

module.exports = new ItemRepository();
