import type { CollectionEntry } from '../types/models';

const KEY = 'youplan.collections.v1';

function isCollection(x: unknown): x is CollectionEntry {
  if (!x || typeof x !== 'object') return false;
  const c = x as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.planId === 'string' &&
    typeof c.planTitle === 'string' &&
    (c.planKind === 'long' || c.planKind === 'short') &&
    (c.kind === 'completed' || c.kind === 'archived') &&
    typeof c.date === 'string' &&
    typeof c.note === 'string' &&
    Array.isArray(c.imageIds)
  );
}

/** 完成收录集仓库：完成/归档的计划自动收录，可补文字与照片 */
export class CollectionRepository {
  load(): CollectionEntry[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isCollection);
    } catch {
      return [];
    }
  }

  save(collections: CollectionEntry[]): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(collections));
    } catch {
      /* 存储失败不阻塞 */
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* 忽略 */
    }
  }
}
