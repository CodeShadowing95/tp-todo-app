import express, { Request, Response } from 'express';
const router = express.Router();

const CHECK_HEALTH = '✅ Health OK';

router.get('/', async (req: Request, res: Response) => {
    res.send({
        health: CHECK_HEALTH,
    });
});

export default router;
