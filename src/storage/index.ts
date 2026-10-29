export type { StorageAdapter } from './StorageAdapter';
export { LocalStorageAdapter } from './LocalStorageAdapter';

export const STORAGE_KEYS = {
  plans: 'youplan:plans',
  logs: 'youplan:logs',
  settings: 'youplan:settings',
  diary: 'youplan:diary',
} as const;
