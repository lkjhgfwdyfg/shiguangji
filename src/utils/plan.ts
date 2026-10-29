import type { ShortPlan } from '../types/models';
import { todayISO, weekdayCN, formatDateCN, addDays } from './date';

/** 判断一个短期计划今天是否"可以选择做" */
export function isDueToday(p: ShortPlan, today: string): boolean {
  if (p.status !== 'active') return false;
  // 顺延到今天 => 今天出现
  if (p.deferredTo === today) return true;
  if (p.repeat === 'none') return p.date === today;
  if (p.repeat === 'daily') return true;
  // weekly：按计划日期的星期几重复
  return weekdayCN(p.date) === weekdayCN(today);
}

/** 今日卡片状态 */
export type TodayCardState = 'due' | 'done' | 'skipped';

export function todayCardState(p: ShortPlan, today: string): TodayCardState {
  if (p.completedDates.includes(today)) return 'done';
  if (p.skippedDates.includes(today)) return 'skipped';
  return 'due';
}

/** 短期计划的日期展示文案 */
export function shortDateLabel(p: ShortPlan, today: string): string {
  if (p.deferredTo && p.deferredTo > today) {
    return p.deferredTo === addDays(today, 1) ? '已顺延到明天' : `已顺延到 ${formatDateCN(p.deferredTo)}`;
  }
  if (p.repeat === 'daily') return '每天';
  if (p.repeat === 'weekly') return `每周${weekdayCN(p.date)}`;
  if (p.date === today) return '今天';
  if (p.date === addDays(today, 1)) return '明天';
  return formatDateCN(p.date);
}

export function repeatLabel(repeat: ShortPlan['repeat']): string {
  if (repeat === 'daily') return '每天';
  if (repeat === 'weekly') return '每周';
  return '一次';
}

export { todayISO };
