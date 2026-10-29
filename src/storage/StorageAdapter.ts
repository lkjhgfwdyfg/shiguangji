// ============ 存储适配器抽象 ============
// 数据层通过 StorageAdapter 读写，当前实现为 localStorage；
// 未来替换为 IndexedDB / SQLite / 云同步时，只需新增一个实现类。

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}
