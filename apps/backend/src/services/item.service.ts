import itemRepository from '../repositories/item.repository';
import { v4 as uuid } from 'uuid';
import { ItemDto } from '../dto/item.dto';
import { deleteCachedKeys, getCachedJson, setCachedJson } from '../utils/cache';

const ITEMS_CACHE_KEY = 'tasks:all';

function getItemCacheKey(id: string) {
    return `tasks:${id}`;
}

class ItemService {
    async getAllItems() {
        const cachedItems = await getCachedJson<ItemDto[]>(ITEMS_CACHE_KEY);
        if (cachedItems) {
            return cachedItems;
        }

        const items = await itemRepository.getItems();
        await setCachedJson(ITEMS_CACHE_KEY, items);
        return items;
    }

    async getItemById(id: string) {
        const cachedItem = await getCachedJson<ItemDto>(getItemCacheKey(id));
        if (cachedItem) {
            return cachedItem;
        }

        const item = await itemRepository.getItemById(id);
        if (!item) {
            throw new Error('Item not found');
        }

        await setCachedJson(getItemCacheKey(id), item);
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

        const createdItem = await itemRepository.createItem(item);
        await setCachedJson(
            getItemCacheKey(createdItem.id as string),
            createdItem,
        );
        await deleteCachedKeys(ITEMS_CACHE_KEY);
        return createdItem;
    }

    async updateItem(id: string, itemData: ItemDto) {
        await this.getItemById(id);

        const updatedItem = await itemRepository.updateItem(id, itemData);
        await setCachedJson(getItemCacheKey(id), updatedItem);
        await deleteCachedKeys(ITEMS_CACHE_KEY);
        return updatedItem;
    }

    async deleteItem(id: string) {
        await this.getItemById(id);

        await itemRepository.deleteItem(id);
        await deleteCachedKeys(ITEMS_CACHE_KEY, getItemCacheKey(id));
    }
}

export default new ItemService();
