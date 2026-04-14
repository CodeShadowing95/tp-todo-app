import { ItemDto } from '../dto/item.dto';
const db = require('../persistence');

class ItemRepository {
    async getItems() {
        return <ItemDto[]>await db.getItems();
    }

    async getItemById(id: string) {
        return <ItemDto>await db.getItem(id);
    }

    async createItem(item: ItemDto) {
        await db.storeItem(item);
        return item;
    }

    async updateItem(id: string, itemData: ItemDto) {
        await db.updateItem(id, itemData);
        return <ItemDto>await db.getItem(id);
    }

    async deleteItem(id: string) {
        const item = await this.getItemById(id);
        if (!item) {
            throw new Error('Item not found');
        }
        await db.removeItem(id);
    }
}

export default new ItemRepository();
