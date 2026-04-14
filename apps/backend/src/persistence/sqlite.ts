import { ItemDto } from '../dto/item.dto';

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const defaultLocation = path.join(process.cwd(), 'data', 'todo.db');
const location = process.env.SQLITE_DB_LOCATION || defaultLocation;

let db: any, dbAll: any, dbRun: any;

export function init() {
    const dirName = path.dirname(location);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    return new Promise<void>((acc: () => void, rej: (err: any) => void) => {
        db = new sqlite3.Database(location, (err: any) => {
            if (err) return rej(err);

            if (process.env.NODE_ENV !== 'test')
                console.log(`Using sqlite database at ${location}`);

            db.run(
                'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
                (err: any, result: any) => {
                    if (err) return rej(err);
                    acc();
                },
            );
        });
    });
}

export async function teardown() {
    return new Promise<void>((acc: () => void, rej: (err: any) => void) => {
        db.close((err: any) => {
            if (err) rej(err);
            else acc();
        });
    });
}

export async function getItems() {
    return new Promise<ItemDto[]>(
        (acc: (items: ItemDto[]) => void, rej: (err: any) => void) => {
            db.all('SELECT * FROM todo_items', (err: any, rows: any[]) => {
                if (err) return rej(err);
                acc(
                    rows.map((item) =>
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
    return new Promise<ItemDto>((acc, rej) => {
        db.all(
            'SELECT * FROM todo_items WHERE id=?',
            [id],
            (err: any, rows: any[]) => {
                if (err) return rej(err);
                acc(
                    rows.map((item) =>
                        Object.assign({}, item, {
                            completed: item.completed === 1,
                        }),
                    )[0],
                );
            },
        );
    });
}

export async function storeItem(item: ItemDto) {
    return new Promise<void>((acc: () => void, rej: (err: any) => void) => {
        db.run(
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
        db.run(
            'UPDATE todo_items SET name=?, completed=? WHERE id = ?',
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
        db.run('DELETE FROM todo_items WHERE id = ?', [id], (err: any) => {
            if (err) return rej(err);
            acc();
        });
    });
}
