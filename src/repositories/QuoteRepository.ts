import type { Quote, QuoteScene } from '../types/models';
import { buildInitialQuotes, BUILTIN, BUILTIN_TEXTS, BUILTIN_VERSION, QUOTE_SCENES } from '../data/quotes';
import { uid } from '../utils/id';

const KEY = 'youplan.quotes.v1';
const META_KEY = 'youplan.quotes.meta.v1';

interface QuoteMeta {
  builtinVersion: number;
  seenTexts: string[];
}

function isQuote(x: unknown): x is Quote {
  if (!x || typeof x !== 'object') return false;
  const q = x as Record<string, unknown>;
  return (
    typeof q.id === 'string' &&
    typeof q.text === 'string' &&
    (q.scene === 'open' || q.scene === 'done' || q.scene === 'defer' || q.scene === 'skip' || q.scene === 'review')
  );
}

function readMeta(): QuoteMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const m = JSON.parse(raw) as Record<string, unknown>;
    if (typeof m.builtinVersion !== 'number' || !Array.isArray(m.seenTexts)) return null;
    return { builtinVersion: m.builtinVersion, seenTexts: m.seenTexts.filter((t) => typeof t === 'string') };
  } catch {
    return null;
  }
}

function writeMeta(meta: QuoteMeta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* 忽略 */
  }
}

/** 按句子文本反查内置场景（增量补句用） */
function sceneOfText(text: string): QuoteScene | null {
  for (const scene of QUOTE_SCENES) {
    if (BUILTIN[scene].includes(text)) return scene;
  }
  return null;
}

/** 语录集仓库：整个池（内置 + 自添加）持久化在 localStorage */
export class QuoteRepository {
  load(): Quote[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return this.fresh();
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return this.fresh();
      const quotes = parsed.filter(isQuote);
      if (quotes.length === 0) return this.fresh();
      return this.mergeBuiltinUpdates(quotes);
    } catch {
      return this.fresh();
    }
  }

  /** 首次初始化（或本地数据损坏）：写入内置池 + 记录已见过全部内置句 */
  private fresh(): Quote[] {
    const quotes = buildInitialQuotes();
    this.save(quotes);
    writeMeta({ builtinVersion: BUILTIN_VERSION, seenTexts: BUILTIN_TEXTS });
    return quotes;
  }

  /**
   * 增量合并：老用户本地已有池时，把新版内置池中「没见过的新句」补进去。
   * 只按"是否见过"判断，用户主动删掉的句子不会复活。
   */
  private mergeBuiltinUpdates(quotes: Quote[]): Quote[] {
    let meta = readMeta();
    if (!meta) {
      // 老版本迁移：认为当前池里已有的句子都已见过
      meta = { builtinVersion: 0, seenTexts: quotes.map((q) => q.text) };
    }
    if (meta.builtinVersion >= BUILTIN_VERSION) return quotes;

    const newTexts = BUILTIN_TEXTS.filter((t) => !meta!.seenTexts.includes(t));
    if (newTexts.length > 0) {
      for (const t of newTexts) {
        const scene = sceneOfText(t);
        if (scene) quotes.push({ id: uid(), scene, text: t });
      }
      this.save(quotes);
    }
    writeMeta({ builtinVersion: BUILTIN_VERSION, seenTexts: BUILTIN_TEXTS });
    return quotes;
  }

  save(quotes: Quote[]): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(quotes));
    } catch {
      /* 存储失败不阻塞 */
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(META_KEY);
    } catch {
      /* 忽略 */
    }
  }
}
