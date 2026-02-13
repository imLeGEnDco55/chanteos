// IndexedDB wrapper for audio file storage
// This avoids localStorage size limits (~5MB) by using IndexedDB which can store much larger files
import { convertToOpus } from './audioConverter';

const DB_NAME = 'songwriting-notebook-audio';
const DB_VERSION = 1;
const STORE_NAME = 'audio-files';

interface AudioEntry {
  songId: string;
  blob: Blob;
  fileName: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'songId' });
      }
    };
  });
}

export async function saveAudioToIndexedDB(songId: string, file: File): Promise<{ blobUrl: string; fileName: string }> {
  try {
    // Convert to Opus for optimized storage & RAM usage
    const optimizedFile = await convertToOpus(file);

    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const entry: AudioEntry = {
        songId,
        blob: optimizedFile,
        fileName: optimizedFile.name,
      };

      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Create blob URL for immediate use
        const blobUrl = URL.createObjectURL(optimizedFile);
        resolve({ blobUrl, fileName: optimizedFile.name });
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error saving audio to IndexedDB:', error);
    throw error;
  }
}

export async function loadAudioFromIndexedDB(songId: string): Promise<{ blobUrl: string; fileName: string } | null> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(songId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as AudioEntry | undefined;
        if (entry?.blob) {
          const blobUrl = URL.createObjectURL(entry.blob);
          resolve({ blobUrl, fileName: entry.fileName });
        } else {
          resolve(null);
        }
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error loading audio from IndexedDB:', error);
    return null;
  }
}

export async function deleteAudioFromIndexedDB(songId: string): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(songId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error deleting audio from IndexedDB:', error);
  }
}

export async function loadAllAudioFromIndexedDB(): Promise<Map<string, { blobUrl: string; fileName: string }>> {
  const audioMap = new Map<string, { blobUrl: string; fileName: string }>();

  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entries = request.result as AudioEntry[];
        entries.forEach((entry) => {
          if (entry.blob) {
            const blobUrl = URL.createObjectURL(entry.blob);
            audioMap.set(entry.songId, { blobUrl, fileName: entry.fileName });
          }
        });
        resolve(audioMap);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error loading all audio from IndexedDB:', error);
    return audioMap;
  }
}
