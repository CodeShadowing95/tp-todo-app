import dotenv from 'dotenv';
import { DbConfig } from '../types';

dotenv.config();

const config = {
    development: {
        db: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            name: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        } as DbConfig,
    },
    production: {
        db: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            name: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        } as DbConfig,
    },
    test: {
        db: {
            host: 'localhost',
            port: 5432,
            name: 'test_db',
            user: 'postgres',
            password: 'postgres',
        } as DbConfig,
    },
};

const envFromProcess = process.env.NODE_ENV;
const env =
    envFromProcess && envFromProcess in config
        ? (envFromProcess as keyof typeof config)
        : 'development';

export default config[env];
