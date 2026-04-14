type Persistence = {
    init: () => Promise<void>;
    teardown: () => Promise<void>;
    getItems: () => Promise<unknown[]>;
    getItem: (id: string) => Promise<unknown>;
    storeItem: (item: unknown) => Promise<void>;
    updateItem: (id: string, item: unknown) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
};

const db: Persistence = process.env.MYSQL_HOST
    ? (require('./mysql') as Persistence)
    : (require('./sqlite') as Persistence);

export const init = db.init;
export const teardown = db.teardown;
export const getItems = db.getItems;
export const getItem = db.getItem;
export const storeItem = db.storeItem;
export const updateItem = db.updateItem;
export const removeItem = db.removeItem;
