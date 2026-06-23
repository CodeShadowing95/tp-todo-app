import dotenv from 'dotenv';
import express from 'express';
import errorHandler from './middleware/error.middleware';
import authRoutes from './routes';
import logger from './utils/logger';
import { requestLogger } from './middleware/logger.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { register } from './utils/metrics';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

app.use(requestLogger);
app.use(metricsMiddleware);

app.get('/health', (_req: express.Request, res: express.Response) => {
    res.status(200).send('OK');
});

app.get('/metrics', async (_req: express.Request, res: express.Response) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        logger.error('Unable to generate metrics', { error });
        res.status(500).send('Unable to generate metrics');
    }
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info('Auth server listening', { port: PORT });
});
