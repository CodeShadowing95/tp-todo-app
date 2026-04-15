import dotenv from 'dotenv';
import express from 'express';
import errorHandler from './middleware/error.middleware';
import * as db from './persistence';
import apiRoutes from './routes';
import logger from './utils/logger';
import { requestLogger } from './middleware/loggermiddleware';
import { metricsMiddleware } from './middleware/metricsmiddleware';
import { register } from './utils/metrics';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use(requestLogger);
app.use(metricsMiddleware);

app.get('/metrics', async (_req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        logger.error('Unable to generate metrics', { error });
        res.status(500).send('Unable to generate metrics');
    }
});

app.use('/api', apiRoutes);

app.use(errorHandler);

logger.info('Server starting...');

db.init()
    .then(() => {
        app.listen(PORT, () => {
            logger.info('Server listening', { port: PORT });
        });
    })
    .catch((err: Error) => {
        logger.error('Database initialization failed', {
            message: err.message,
            stack: err.stack,
        });
        process.exit(1);
    });

const gracefulShutdown = () => {
    logger.info('Graceful shutdown started');

    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);