/**
 * File Storage Service - IndexedDB-based storage for imported files
 * Handles large file storage that exceeds localStorage limits
 */

const DB_NAME = 'digitalium-files';
const DB_VERSION = 1;
const STORE_NAME = 'files';

interface StoredFile {
    id: string;
    dataUrl: string;
    mimeType: string;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Opens or creates the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Failed to open IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Stores a file's content in IndexedDB
 */
export async function storeFileContent(id: string, dataUrl: string, mimeType: string): Promise<void> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.put({ id, dataUrl, mimeType });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Failed to store file content:', error);
    }
}

/**
 * Retrieves a file's content from IndexedDB
 */
export async function getFileContent(id: string): Promise<StoredFile | null> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Failed to get file content:', error);
        return null;
    }
}

/**
 * Deletes a file's content from IndexedDB
 */
export async function deleteFileContent(id: string): Promise<void> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Failed to delete file content:', error);
    }
}

/**
 * Clears all stored file content
 */
export async function clearAllFileContent(): Promise<void> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Failed to clear file content:', error);
    }
}
