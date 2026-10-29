import type { StorageAdapter } from '../storage';
import { LocalStorageAdapter, STORAGE_KEYS } from '../storage';
import type { Settings } from '../types/models';

export const DEFAULT_SETTINGS: Settings = {
  notifyEnabled: false, // 通知默认关闭
  dailyQuote: true, // 每日一句默认开启
  accent: 'apricot',
  themeMode: 'light',
  notifyTime: '20:00', // App 内本地提醒时间（默认晚上八点）
};

export class SettingsRepository {
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  load(): Settings {
    const saved = this.storage.get<Partial<Settings>>(STORAGE_KEYS.settings);
    return { ...DEFAULT_SETTINGS, ...(saved ?? {}) };
  }

  save(settings: Settings): void {
    this.storage.set(STORAGE_KEYS.settings, settings);
  }
}
