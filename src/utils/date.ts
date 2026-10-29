// ============ 日期工具（本地时区，避免 UTC 偏移问题）============

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Date -> YYYY-MM-DD（本地日期） */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** YYYY-MM-DD -> Date（按本地时区解析） */
export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

const WEEK_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/** 返回 "周一" ~ "周日" */
export function weekdayCN(s: string): string {
  return WEEK_CN[parseISO(s).getDay()];
}

/** 返回 "9月22日 周二" */
export function formatDateCN(s: string): string {
  const d = parseISO(s);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdayCN(s)}`;
}

/** 今日的完整日期文案，如 "9月22日 周二" */
export function todayLabel(): string {
  return formatDateCN(todayISO());
}

/** 按时间段问候：早上好 / 下午好 / 晚上好 */
export function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 12) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

/** 两个日期是否在同一周（周一起算） */
export function isSameWeek(a: string, b: string): boolean {
  const da = parseISO(a);
  const db = parseISO(b);
  const monday = startOfWeek(da);
  const end = new Date(monday);
  end.setDate(monday.getDate() + 7);
  return db >= monday && db < end;
}

/** 两个日期是否在同一月 */
export function isSameMonth(a: string, b: string): boolean {
  const da = parseISO(a);
  const db = parseISO(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

/** 本周（周一到周日）的所有日期 */
export function weekDates(today: string): string[] {
  const monday = startOfWeek(parseISO(today));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toISODate(d);
  });
}

/** 返回 "一" ~ "日"（周几的短标签） */
export function weekDayShort(s: string): string {
  return ['一', '二', '三', '四', '五', '六', '日'][(parseISO(s).getDay() + 6) % 7];
}

function startOfWeek(d: Date): Date {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

/** 是否早于今天 */
export function isPast(s: string): boolean {
  return s < todayISO();
}

/** ISO 时间 -> "HH:mm"（本地时区） */
export function formatTimeHM(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
