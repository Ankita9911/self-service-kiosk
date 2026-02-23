import { getDB } from "./indexdb";


export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  stockQuantity: number;
}

export interface MenuCategory {
  _id: string;
  name: string;
  displayOrder?: number;
  items: MenuItem[];
}

export async function saveMenu(menuData: any) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("menuStore", "readwrite");
    const store = tx.objectStore("menuStore");

    store.put({
      key: "menu",
      data: menuData,
      updatedAt: Date.now(),
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMenuFromCache() {
  const db = getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("menuStore", "readonly");
    const store = tx.objectStore("menuStore");

    const request = store.get("menu");

    request.onsuccess = () => {
      resolve(request.result?.data || null);
    };

    request.onerror = () => reject(request.error);
  });
}
