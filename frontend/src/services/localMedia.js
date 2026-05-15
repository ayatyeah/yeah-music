const DB_NAME = 'yeahmusic-media';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio';

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async (mode, callback) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, mode);
    const store = tx.objectStore(AUDIO_STORE);
    const result = callback(store);

    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
};

export const saveAudioFile = async (file) => {
  const id = `audio_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  await withStore('readwrite', (store) => store.put(file, id));
  return id;
};

export const getAudioBlob = async (id) =>
  withStore('readonly', (store) =>
    new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    })
  );

export const removeAudioBlob = async (id) =>
  withStore('readwrite', (store) => store.delete(id));
