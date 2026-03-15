const DB_NAME = import.meta.env.VITE_DB_NAME;
const DB_VERSION = import.meta.env.VITE_DB_VERSION;

let db: IDBDatabase;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("menuStore")) {
        database.createObjectStore("menuStore", { keyPath: "key" });
      }
      if (!database.objectStoreNames.contains("syncQueue")) {
        database.createObjectStore("syncQueue", { keyPath: "clientOrderId" });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

export function getDB(): IDBDatabase {
  if (!db) {
    throw new Error("DB not initialized. Call initDB() first.");
  }
  return db;
}
