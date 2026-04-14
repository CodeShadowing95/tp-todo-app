import { ItemDto } from '../dto/item.dto';

const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql2');

const {
    MYSQL_HOST: HOST,
    MYSQL_USER: USER,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
} = process.env;

let pool: any;

export async function init() {
    const host = HOST;
    const user = USER;
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
    const database = DB;

    await waitPort({
        host,
        port: 3306,
        timeout: 10000,
        waitForDns: true,
    });

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
        charset: 'utf8mb4',
    });

    return new Promise<void>((acc: () => void, rej: (err: any) => void) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean) DEFAULT CHARSET utf8mb4',
            (err: any) => {
                if (err) return rej(err);

                console.log(`Connected to mysql db at host ${HOST}`);
                acc();
            },
        );
    });
}

export async function teardown() {
    return new Promise<void>((acc: () => void, rej: (err: any) => void) => {
        pool.end((err: any) => {
            if (err) rej(err);
            else acc();
        });
    });
}

export async function getItems() {
    return new Promise<ItemDto[]>(
        (acc: (items: ItemDto[]) => void, rej: (err: any) => void) => {
            pool.query('SELECT * FROM todo_items', (err: any, rows: any[]) => {
                if (err) return rej(err);
                acc(
                    rows.map((item: any) =>
                        Object.assign({}, item, {
                            completed: item.completed === 1,
                        }),
                    ),
                );
            });
        },
    );
}

export async function getItem(id: string) {
    return new Promise<ItemDto>(
        (acc: (item: ItemDto) => void, rej: (err: any) => void) => {
            pool.query(
                'SELECT * FROM todo_items WHERE id=?',
                [id],
                (err: any, rows: any[]) => {
                    if (err) return rej(err);
                    acc(
                        rows.map((item: any) =>
                            Object.assign({}, item, {
                                completed: item.completed === 1,
                            }),
                        )[0],
                    );
                },
            );
        },
    );
}

export async function storeItem(item: ItemDto) {
    return new Promise<void>((acc: () => void, rej: (err: any) => void) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            (err: any) => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

export async function updateItem(id: string, item: ItemDto) {
    return new Promise<void>((acc: () => void, rej: (err: any) => void) => {
        pool.query(
            'UPDATE todo_items SET name=?, completed=? WHERE id=?',
            [item.name, item.completed ? 1 : 0, id],
            (err: any) => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

export async function removeItem(id: string) {
    return new Promise<void>((acc: () => void, rej: (err: any) => void) => {
        pool.query('DELETE FROM todo_items WHERE id = ?', [id], (err: any) => {
            if (err) return rej(err);
            acc();
        });
    });
}
