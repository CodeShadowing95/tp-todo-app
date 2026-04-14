import dotenv from 'dotenv';
import express from 'express';
import errorHandler from './middleware/error.middleware';
import * as db from './persistence';
import apiRoutes from './routes';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api', apiRoutes);
app.use(errorHandler);

db.init()
    .then(() => {
        app.listen(3000, () => console.log('Listening on port 3000'));
    })
    .catch((err: Error) => {
        console.error(err.message);
        process.exit(1);
    });

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
