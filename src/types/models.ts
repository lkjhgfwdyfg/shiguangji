// ============ 数据模型 ============
// 当前 MVP 全部数据保存在本地（localStorage，通过存储适配器抽象），
// 未来可替换为 SQLite / 云同步，模型保持稳定。

export type PlanKind = 'long' | 'short';
export type PlanStatus = 'active' | 'paused' | 'completed' | 'archived';
export type RepeatRule = 'none' | 'daily' | 'weekly';
export type LogKind = 'done' | 'deferred' | 'skipped';

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface BasePlan {
  id: string;
  kind: PlanKind;
  title: string;
  status: PlanStatus;
  notes?: string;
  createdAt: string; // ISO
  completedAt?: string; // ISO
  archivedAt?: string; // ISO
}

/** 长期计划：目标 + 为什么 + 期望周期 + 阶段/里程碑 + 关联短期行动 */
export interface LongPlan extends BasePlan {
  kind: 'long';
  why: string;
  period: string; // 期望周期，自由文本，如 "3 个月"
  milestones: Milestone[];
  relatedShortIds: string[];
}

/** 短期计划：任务或习惯 + 日期 + 重复规则 + 预计时长 + 子步骤 + 备注 */
export interface ShortPlan extends BasePlan {
  kind: 'short';
  date: string; // YYYY-MM-DD 计划日期
  repeat: RepeatRule; // none / daily / weekly
  durationMin?: number; // 预计时长（分钟）
  steps: string[]; // 子步骤
  completedDates: string[]; // 已完成的日期（每天重复时逐日累计）
  skippedDates: string[]; // 今天先跳过的日期
  deferredTo?: string; // 顺延到的日期（YYYY-MM-DD）
}

export type Plan = LongPlan | ShortPlan;

/** 行为日志：用于回顾页的温柔统计，只记录"选择"，不做评判 */
export interface ActionLog {
  id: string;
  planId: string;
  planTitle: string;
  planKind: PlanKind;
  kind: LogKind;
  date: string; // YYYY-MM-DD
  at: string; // ISO
}

export type ThemeAccent = 'apricot' | 'sunny' | 'sage';
export type ThemeMode = 'light' | 'dark' | 'system';

/** 语录场景：打开 App / 完成 / 顺延 / 跳过 / 回顾 */
export type QuoteScene = 'open' | 'done' | 'defer' | 'skip' | 'review';

/** 一条语录（内置 + 用户自添加，统一存本地，可增删改） */
export interface Quote {
  id: string;
  scene: QuoteScene;
  text: string;
}

export interface Settings {
  notifyEnabled: boolean; // 通知默认关闭
  dailyQuote: boolean; // 每日一句
  accent: ThemeAccent;
  themeMode: ThemeMode;
  notifyTime: string; // "HH:mm"，App 内本地提醒时间
}

/** 日记条目（文字 + 图片）。图片本体存 IndexedDB，条目只存图片 id */
export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD，可多个条目同一天
  text: string;
  imageIds: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** 灵感：随手记下的一句话 / 想法 */
export interface Inspiration {
  id: string;
  text: string;
  createdAt: string; // ISO
}

/** 日记与灵感的数据集合 */
export interface DiaryData {
  entries: DiaryEntry[];
  inspirations: Inspiration[];
  quoteFavs: string[]; // 收藏的每日一句原文
}

/** 完成收录的类型：完成 / 归档 */
export type CollectionKind = 'completed' | 'archived';

/** 完成收录：计划完成/归档时自动收进回顾页的一条记录，可补文字与照片 */
export interface CollectionEntry {
  id: string;
  planId: string;
  planTitle: string; // 标题快照，计划删除后仍可显示
  planKind: PlanKind;
  kind: CollectionKind;
  date: string; // YYYY-MM-DD 完成/归档日期
  note: string; // 这段记录的文字
  imageIds: string[]; // 照片 id（本体存 IndexedDB）
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** 导出 / 导入的备份文件结构 */
export interface ExportFile {
  app: string;
  version: string;
  exportedAt: string;
  plans: Plan[];
  logs: ActionLog[];
  settings: Settings;
  quotes?: Quote[]; // 语录集（内置 + 自添加）
  diary?: DiaryData; // 日记文字与灵感（图片本体不入备份，留在本机）
  collections?: CollectionEntry[]; // 完成收录集（文字与元数据；照片本体不入备份）
}

// ============ 表单输入 ============
export interface LongPlanInput {
  title: string;
  why: string;
  period: string;
  milestones: Milestone[];
  relatedShortIds: string[];
  notes?: string;
}

export interface ShortPlanInput {
  title: string;
  date: string;
  repeat: RepeatRule;
  durationMin?: number;
  steps: string[];
  notes?: string;
}

export type PlanInput = LongPlanInput | ShortPlanInput;
