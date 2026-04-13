require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  production: {
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  test: {
    db: {
      host: 'localhost',
      port: 5432,
      name: 'test_db',
      user: 'postgres',
      password: 'postgres',
    },
  },
};

module.exports = config[env];