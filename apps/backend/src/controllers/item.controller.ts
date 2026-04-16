import { Request, Response } from 'express';
import { ItemDto } from '@dto/item.dto';
import ItemService from '@services/item.service';

class ItemController {
    async getItems(_req: Request, res: Response) {
        const items: ItemDto[] = await ItemService.getAllItems();
        res.send(items);
    }

    async getItem(req: Request, res: Response) {
        const item: ItemDto = await ItemService.getItemById(
            req.params.id as string,
        );
        res.send(item);
    }

    async addItem(req: Request, res: Response) {
        const body: ItemDto = req.body as ItemDto;
        const item: ItemDto = await ItemService.createItem(body.name);
        res.send(item);
    }

    async updateItem(req: Request, res: Response) {
        const itemData: ItemDto = {
            name: req.body.name,
            completed: req.body.completed,
        };
        const item: ItemDto = await ItemService.updateItem(
            req.params.id as string,
            itemData,
        );
        res.send(item);
    }

    async deleteItem(req: Request, res: Response) {
        await ItemService.deleteItem(req.params.id as string);
        res.sendStatus(200);
    }
}

export default new ItemController();
