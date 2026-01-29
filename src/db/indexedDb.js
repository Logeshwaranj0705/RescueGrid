import Dexie from "dexie";

export const db = new Dexie("shelterflow_db");

db.version(1).stores({
  shelters: "id, name, type, updatedAt",
  reports: "++id, shelterId, message, createdAt"
});