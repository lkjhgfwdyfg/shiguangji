// ============ 图片存储：IndexedDB ============
// 日记图片体积大，不放进 localStorage（5MB 上限），改用 IndexedDB 保存。
// 与 StorageAdapter 抽象同思路：未来可替换为 SQLite / 云存储。

const DB_NAME = 'youplan-media';
const DB_VERSION = 1;
const STORE = 'images';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

class IndexedDBImageStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private db(): Promise<IDBDatabase> {
    if (!this.dbPromise) this.dbPromise = openDB();
    return this.dbPromise;
  }

  /** 保存一张图片，返回其 id */
  async put(id: string, dataUrl: string): Promise<string> {
    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ id, dataUrl });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return id;
  }

  /** 读取一张图片（data URL），不存在返回 null */
  async get(id: string): Promise<string | null> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as { dataUrl?: string } | undefined)?.dataUrl ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  /** 批量读取，返回 id -> dataUrl 的映射 */
  async getMany(ids: string[]): Promise<Record<string, string>> {
    const db = await this.db();
    const out: Record<string, string> = {};
    await Promise.all(
      ids.map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get(id);
            req.onsuccess = () => {
              const dataUrl = (req.result as { dataUrl?: string } | undefined)?.dataUrl;
              if (dataUrl) out[id] = dataUrl;
              resolve();
            };
            req.onerror = () => reject(req.error);
          }),
      ),
    );
    return out;
  }

  async delete(id: string): Promise<void> {
    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** 清空全部图片（清空数据时使用） */
  async clearAll(): Promise<void> {
    const db = await this.db();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

/** 全局单例 */
export const imageStore = new IndexedDBImageStore();
