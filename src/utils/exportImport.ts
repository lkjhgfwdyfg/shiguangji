import type {
  Plan,
  ActionLog,
  Settings,
  Quote,
  ExportFile,
  DiaryData,
  CollectionEntry,
} from '../types/models';
import { todayISO } from './date';

export const APP_VERSION = '0.5.5';
export const APP_NAME = '拾光记';

/** 组装备份 JSON */
export function buildExport(
  plans: Plan[],
  logs: ActionLog[],
  settings: Settings,
  quotes: Quote[],
  diary?: DiaryData,
  collections?: CollectionEntry[],
): ExportFile {
  return {
    app: APP_NAME,
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    plans,
    logs,
    settings,
    quotes: quotes.length > 0 ? quotes : undefined,
    diary: diary && (diary.entries.length || diary.inspirations.length || diary.quoteFavs.length)
      ? diary
      : undefined,
    collections: collections && collections.length > 0 ? collections : undefined,
  };
}

/** 校验导入数据，返回解析后的数据或错误信息 */
export function parseImport(raw: string):
  | {
      ok: true;
      data: {
        plans: Plan[];
        logs: ActionLog[];
        settings: Partial<Settings>;
        quotes?: Quote[];
        diary?: DiaryData;
        collections?: CollectionEntry[];
      };
    }
  | { ok: false; message: string } {
  try {
    const obj = JSON.parse(raw) as Partial<ExportFile>;
    if (!obj || typeof obj !== 'object') {
      return { ok: false, message: '文件内容不是有效的 JSON。' };
    }
    if (!Array.isArray(obj.plans)) {
      return { ok: false, message: '文件里没有找到计划数据（plans）。' };
    }
    const plans = obj.plans as Plan[];
    const logs = Array.isArray(obj.logs) ? (obj.logs as ActionLog[]) : [];
    const settings: Partial<Settings> = obj.settings
      ? (obj.settings as Partial<Settings>)
      : {};
    const isScene = (s: unknown): s is Quote['scene'] =>
      s === 'open' || s === 'done' || s === 'defer' || s === 'skip' || s === 'review';
    const quotes: Quote[] | undefined = Array.isArray(obj.quotes)
      ? obj.quotes.filter(
          (q): q is Quote =>
            !!q &&
            typeof q === 'object' &&
            typeof (q as Quote).id === 'string' &&
            typeof (q as Quote).text === 'string' &&
            isScene((q as Quote).scene),
        )
      : undefined;
    const diary: DiaryData | undefined =
      obj.diary && typeof obj.diary === 'object'
        ? {
            entries: Array.isArray(obj.diary.entries) ? obj.diary.entries : [],
            inspirations: Array.isArray(obj.diary.inspirations) ? obj.diary.inspirations : [],
            quoteFavs: Array.isArray(obj.diary.quoteFavs) ? obj.diary.quoteFavs : [],
          }
        : undefined;
    const collections: CollectionEntry[] | undefined = Array.isArray(obj.collections)
      ? obj.collections.filter(
          (c): c is CollectionEntry =>
            !!c &&
            typeof c === 'object' &&
            typeof (c as CollectionEntry).id === 'string' &&
            typeof (c as CollectionEntry).planTitle === 'string' &&
            typeof (c as CollectionEntry).date === 'string' &&
            typeof (c as CollectionEntry).note === 'string' &&
            Array.isArray((c as CollectionEntry).imageIds),
        )
      : undefined;
    return { ok: true, data: { plans, logs, settings, quotes, diary, collections } };
  } catch {
    return { ok: false, message: '文件解析失败，请确认是拾光记导出的 JSON 备份。' };
  }
}

/** 触发浏览器下载文件 */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function backupFilename(): string {
  return `${APP_NAME}-备份-${todayISO()}.json`;
}
