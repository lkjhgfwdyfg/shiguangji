// ============ 累计写字数 ============
// 温柔见证：统计你在拾光记里亲手写下的字。
// 范围（用户主动写下的文字）：
//   - 计划：标题、备注、长期计划的"为什么/期望周期/里程碑"、短期计划的子步骤
//   - 日记：每条日记的文字
//   - 灵感：随手记下的想法
//   - 完成收录：完成/归档计划时补记的文字
// 不含语录池（内置与自增混存，且多为名人名言引用，不算"自己写下的字"）。
// 算法：去掉空白后统计非空白字符数（中文/英文/数字/标点都算"字"）。

import type { Plan, DiaryData, CollectionEntry } from '../types/models';
import { STORAGE_KEYS } from '../storage';

const COLLECTIONS_KEY = 'youplan.collections.v1';

function countChars(s: string): number {
  return s.replace(/\s+/g, '').length;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 统计当前所有用户写下文字的总字数（实时计算，设置页打开时刷新） */
export function countWrittenWords(): number {
  let total = 0;

  // 计划
  const plans = safeParse<Plan[]>(localStorage.getItem(STORAGE_KEYS.plans), []);
  for (const p of plans) {
    total += countChars(p.title);
    if (p.notes) total += countChars(p.notes);
    if (p.kind === 'long') {
      total += countChars(p.why) + countChars(p.period);
      for (const m of p.milestones) total += countChars(m.title);
    } else {
      for (const s of p.steps) total += countChars(s);
    }
  }

  // 日记 + 灵感
  const diary = safeParse<DiaryData>(
    localStorage.getItem(STORAGE_KEYS.diary),
    { entries: [], inspirations: [], quoteFavs: [] },
  );
  for (const e of diary.entries ?? []) total += countChars(e.text);
  for (const i of diary.inspirations ?? []) total += countChars(i.text);

  // 完成收录补记
  const cols = safeParse<CollectionEntry[]>(localStorage.getItem(COLLECTIONS_KEY), []);
  for (const c of cols) total += countChars(c.note);

  return total;
}

/** 千分位格式化，如 12580 -> "12,580" */
export function formatCount(n: number): string {
  return n.toLocaleString('zh-CN');
}
