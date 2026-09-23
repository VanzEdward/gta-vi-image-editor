// VCPD Mugshot Lab - IndexedDB Local Persistence Engine
// Supports high-resolution images, base64 data URLs, and full criminal dossier persistence across reloads

const DB_NAME = "vcpd_mugshot_db";
const DB_VERSION = 1;
const STORE_NAME = "dossier_session";
const KEY_CURRENT = "active_custom_suspect";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported in this environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error || new Error("Failed to open IndexedDB"));
    };
  });
}

/**
 * Persists the custom suspect, active image, and composed poster to IndexedDB
 */
export async function saveCustomDossier(data) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const record = {
        suspect: data.suspect,
        currentImage: data.currentImage,
        finalPosterUrl: data.finalPosterUrl || null,
        composedSuspect: data.composedSuspect || null,
        timestamp: Date.now(),
      };
      const req = store.put(record, KEY_CURRENT);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn("[VCPD Storage] Failed to auto-save to IndexedDB:", err);
    return false;
  }
}

/**
 * Loads the saved custom suspect session from IndexedDB if one exists
 */
export async function loadCustomDossier() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_CURRENT);
      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn("[VCPD Storage] Failed to load from IndexedDB:", err);
    return null;
  }
}

/**
 * Clears the saved custom suspect session from IndexedDB
 */
export async function clearCustomDossier() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY_CURRENT);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn("[VCPD Storage] Failed to clear IndexedDB:", err);
    return false;
  }
}
