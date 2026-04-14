import express from 'express';
import itemController from '../controllers/item.controller';

const router = express.Router();

router.get('/', itemController.getItems);
router.get('/:id', itemController.getItem);
router.post('/', itemController.addItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;
