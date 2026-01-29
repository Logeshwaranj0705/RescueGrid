import { openDB } from "idb";

export const dbPromise = openDB("rescuegrid_db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("queue")) db.createObjectStore("queue", { keyPath: "id" });
  },
});

export async function queueAction(action) {
  const db = await dbPromise;
  await db.put("queue", action);
}

export async function drainQueue(handler) {
  const db = await dbPromise;
  const all = await db.getAll("queue");
  for (const item of all) {
    await handler(item);
    await db.delete("queue", item.id);
  }
}
