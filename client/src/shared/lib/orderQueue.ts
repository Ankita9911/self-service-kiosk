import { getDB } from "./indexdb";

export async function addToQueue(orderPayload: any) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");

    store.put({
      clientOrderId: orderPayload.clientOrderId,
      payload: orderPayload,
      status: "PENDING",
      createdAt: Date.now(),
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingOrders(): Promise<any[]> {
  const db = getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncQueue", "readonly");
    const store = tx.objectStore("syncQueue");

    const request = store.getAll();

    request.onsuccess = () => {
      const all = request.result || [];
      resolve(all.filter((o: any) => o.status === "PENDING"));
    };

    request.onerror = () => reject(request.error);
  });
}

export async function markOrderSynced(clientOrderId: string) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");

    const request = store.get(clientOrderId);

    request.onsuccess = () => {
      const data = request.result;
      if (!data) return resolve(false);

      data.status = "SYNCED";
      store.put(data);
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
