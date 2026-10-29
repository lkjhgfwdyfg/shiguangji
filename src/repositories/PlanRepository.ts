import type { StorageAdapter } from '../storage';
import { LocalStorageAdapter, STORAGE_KEYS } from '../storage';
import type { Plan, ActionLog } from '../types/models';

export interface PlanData {
  plans: Plan[];
  logs: ActionLog[];
}

/** 计划与行为日志的仓库：把"存储"和"业务"隔离 */
export class PlanRepository {
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  load(): PlanData {
    return {
      plans: this.storage.get<Plan[]>(STORAGE_KEYS.plans) ?? [],
      logs: this.storage.get<ActionLog[]>(STORAGE_KEYS.logs) ?? [],
    };
  }

  save(data: PlanData): void {
    this.storage.set(STORAGE_KEYS.plans, data.plans);
    this.storage.set(STORAGE_KEYS.logs, data.logs);
  }
}
