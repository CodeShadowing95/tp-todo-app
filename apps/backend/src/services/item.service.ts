import itemRepository from '../repositories/item.repository';
import { v4 as uuid } from 'uuid';
import { ItemDto } from '../dto/item.dto';

class ItemService {
    async getAllItems() {
        return await itemRepository.getItems();
    }

    async getItemById(id: string) {
        const item = await itemRepository.getItemById(id);
        if (!item) {
            throw new Error('Item not found');
        }
        return item;
    }

    async createItem(name: string) {
        if (!name) {
            throw new Error('Name is required');
        }

        const item = {
            id: uuid(),
            name: name,
            completed: false,
        } as ItemDto;

        return await itemRepository.createItem(item);
    }

    async updateItem(id: string, itemData: ItemDto) {
        await this.getItemById(id);

        return await itemRepository.updateItem(id, itemData);
    }

    async deleteItem(id: string) {
        await this.getItemById(id);

        await itemRepository.deleteItem(id);
    }
}

export default new ItemService();
