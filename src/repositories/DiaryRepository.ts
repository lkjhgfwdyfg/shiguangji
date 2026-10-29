import type { StorageAdapter } from '../storage';
import { LocalStorageAdapter, STORAGE_KEYS } from '../storage';
import type { DiaryData, DiaryEntry, Inspiration } from '../types/models';

const EMPTY: DiaryData = { entries: [], inspirations: [], quoteFavs: [] };

/** 日记 / 灵感 / 语录收藏 的仓库 */
export class DiaryRepository {
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  load(): DiaryData {
    const saved = this.storage.get<Partial<DiaryData>>(STORAGE_KEYS.diary);
    if (!saved) return { ...EMPTY };
    return {
      entries: Array.isArray(saved.entries) ? (saved.entries as DiaryEntry[]) : [],
      inspirations: Array.isArray(saved.inspirations)
        ? (saved.inspirations as Inspiration[])
        : [],
      quoteFavs: Array.isArray(saved.quoteFavs) ? saved.quoteFavs : [],
    };
  }

  save(data: DiaryData): void {
    this.storage.set(STORAGE_KEYS.diary, data);
  }

  clear(): void {
    this.storage.remove(STORAGE_KEYS.diary);
  }
}
