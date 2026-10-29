import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Plan,
  LongPlan,
  ShortPlan,
  ActionLog,
  Settings,
  PlanStatus,
  LogKind,
  LongPlanInput,
  ShortPlanInput,
  DiaryData,
  DiaryEntry,
  Inspiration,
  Quote,
  QuoteScene,
  CollectionEntry,
  CollectionKind,
} from '../types/models';
import { PlanRepository } from '../repositories/PlanRepository';
import { SettingsRepository, DEFAULT_SETTINGS } from '../repositories/SettingsRepository';
import { DiaryRepository } from '../repositories/DiaryRepository';
import { QuoteRepository } from '../repositories/QuoteRepository';
import { CollectionRepository } from '../repositories/CollectionRepository';
import { imageStore } from '../storage/IndexedDBImageStore';
import { uid } from '../utils/id';
import { todayISO, addDays } from '../utils/date';
import { buildExport, parseImport, APP_VERSION, APP_NAME } from '../utils/exportImport';
import { notifications, DAILY_NOTIFY_ID } from '../services/notifications';

interface AppContextValue {
  plans: Plan[];
  longPlans: LongPlan[];
  shortPlans: ShortPlan[];
  logs: ActionLog[];
  settings: Settings;
  diary: DiaryData;
  diaryEntries: DiaryEntry[];
  inspirations: Inspiration[];
  quotes: Quote[];
  collections: CollectionEntry[];
  reviewFocusId: string | null;
  setReviewFocus: (id: string | null) => void;
  addPlan: (kind: 'long' | 'short', input: LongPlanInput | ShortPlanInput) => void;
  updatePlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  setStatus: (id: string, status: PlanStatus) => void;
  completeShort: (id: string) => string | undefined;
  completeLong: (id: string) => string | undefined;
  deferShort: (id: string) => void;
  skipShort: (id: string) => void;
  toggleMilestone: (planId: string, milestoneId: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addDiary: (input: { date: string; text: string; imageIds: string[] }) => void;
  updateDiary: (entry: DiaryEntry) => void;
  deleteDiary: (id: string) => void;
  addInspiration: (text: string) => void;
  deleteInspiration: (id: string) => void;
  addQuote: (scene: QuoteScene, text: string) => void;
  updateQuote: (id: string, scene: QuoteScene, text: string) => void;
  deleteQuote: (id: string) => void;
  randomQuote: (scene: QuoteScene, exclude?: string) => string;
  updateCollection: (id: string, patch: { note?: string; imageIds?: string[] }) => void;
  deleteCollection: (id: string) => void;
  exportJSON: () => string;
  importJSON: (raw: string) => { ok: boolean; message: string };
  clearAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function makeLog(plan: Plan, kind: LogKind): ActionLog {
  return {
    id: uid(),
    planId: plan.id,
    planTitle: plan.title,
    planKind: plan.kind,
    kind,
    date: todayISO(),
    at: new Date().toISOString(),
  };
}

/** 生成一条完成收录（自动收进回顾页） */
function makeCollection(plan: Plan, kind: CollectionKind, date: string): CollectionEntry {
  const now = new Date().toISOString();
  return {
    id: uid(),
    planId: plan.id,
    planTitle: plan.title,
    planKind: plan.kind,
    kind,
    date,
    note: '',
    imageIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const repoRef = useRef<PlanRepository | null>(null);
  if (!repoRef.current) repoRef.current = new PlanRepository();
  const repo = repoRef.current;

  const settingsRepoRef = useRef<SettingsRepository | null>(null);
  if (!settingsRepoRef.current) settingsRepoRef.current = new SettingsRepository();
  const settingsRepo = settingsRepoRef.current;

  const diaryRepoRef = useRef<DiaryRepository | null>(null);
  if (!diaryRepoRef.current) diaryRepoRef.current = new DiaryRepository();
  const diaryRepo = diaryRepoRef.current;

  const quoteRepoRef = useRef<QuoteRepository | null>(null);
  if (!quoteRepoRef.current) quoteRepoRef.current = new QuoteRepository();
  const quoteRepo = quoteRepoRef.current;

  const collectionRepoRef = useRef<CollectionRepository | null>(null);
  if (!collectionRepoRef.current) collectionRepoRef.current = new CollectionRepository();
  const collectionRepo = collectionRepoRef.current;

  const [plans, setPlans] = useState<Plan[]>(() => repo.load().plans);
  const [logs, setLogs] = useState<ActionLog[]>(() => repo.load().logs);
  const [settings, setSettings] = useState<Settings>(() => settingsRepo.load());
  const [diary, setDiary] = useState<DiaryData>(() => diaryRepo.load());
  const [quotes, setQuotes] = useState<Quote[]>(() => quoteRepo.load());
  const [collections, setCollections] = useState<CollectionEntry[]>(() => {
    const saved = collectionRepo.load();
    // 一次性迁移：把「已归档但未完成、且还没有收录」的历史计划补进收录集
    const loadedPlans = repo.load().plans;
    const missing = loadedPlans
      .filter(
        (p) =>
          p.status === 'archived' && !saved.some((c) => c.planId === p.id),
      )
      .map((p) =>
        makeCollection(p, 'archived', p.archivedAt ? p.archivedAt.slice(0, 10) : todayISO()),
      );
    return missing.length > 0 ? [...missing, ...saved] : saved;
  });
  const [reviewFocusId, setReviewFocusId] = useState<string | null>(null);

  // 数据变化即持久化（离线优先）
  useEffect(() => {
    repo.save({ plans, logs });
  }, [plans, logs, repo]);

  useEffect(() => {
    settingsRepo.save(settings);
  }, [settings, settingsRepo]);

  useEffect(() => {
    diaryRepo.save(diary);
  }, [diary, diaryRepo]);

  useEffect(() => {
    quoteRepo.save(quotes);
  }, [quotes, quoteRepo]);

  useEffect(() => {
    collectionRepo.save(collections);
  }, [collections, collectionRepo]);

  // 通知方案 B：只在原生 App 内生效；每天至多一条本地提醒；关闭即取消
  useEffect(() => {
    if (!notifications.isSupported()) return; // 网页版不发送
    if (!settings.notifyEnabled) {
      void notifications.cancel(DAILY_NOTIFY_ID);
      return;
    }
    let cancelled = false;
    (async () => {
      const ok = await notifications.requestPermission();
      if (cancelled || !ok) return;
      const [h, m] = settings.notifyTime.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return;
      await notifications.scheduleDaily(
        DAILY_NOTIFY_ID,
        '拾光记 · 轻轻的提醒',
        '今天没有必须做的事，记得照顾自己就好。',
        h,
        m,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [settings.notifyEnabled, settings.notifyTime]);

  const value = useMemo<AppContextValue>(() => {
    const longPlans = plans.filter((p): p is LongPlan => p.kind === 'long');
    const shortPlans = plans.filter((p): p is ShortPlan => p.kind === 'short');

    const addPlan = (kind: 'long' | 'short', input: LongPlanInput | ShortPlanInput) => {
      const now = new Date().toISOString();
      if (kind === 'long') {
        const i = input as LongPlanInput;
        const plan: LongPlan = {
          id: uid(),
          kind: 'long',
          title: i.title.trim(),
          why: i.why.trim(),
          period: i.period.trim(),
          milestones: i.milestones,
          relatedShortIds: i.relatedShortIds,
          notes: i.notes?.trim() || undefined,
          status: 'active',
          createdAt: now,
        };
        setPlans((prev) => [...prev, plan]);
      } else {
        const i = input as ShortPlanInput;
        const plan: ShortPlan = {
          id: uid(),
          kind: 'short',
          title: i.title.trim(),
          date: i.date,
          repeat: i.repeat,
          durationMin: i.durationMin,
          steps: i.steps,
          notes: i.notes?.trim() || undefined,
          status: 'active',
          createdAt: now,
          completedDates: [],
          skippedDates: [],
        };
        setPlans((prev) => [...prev, plan]);
      }
    };

    const updatePlan = (plan: Plan) => {
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
    };

    const deletePlan = (id: string) => {
      setPlans((prev) =>
        prev
          .filter((p) => p.id !== id)
          .map((p) =>
            p.kind === 'long'
              ? { ...p, relatedShortIds: p.relatedShortIds.filter((sid) => sid !== id) }
              : p,
          ),
      );
    };

    const setStatus = (id: string, status: PlanStatus) => {
      const now = new Date().toISOString();
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const next = { ...p, status };
          if (status === 'completed') next.completedAt = p.completedAt ?? now;
          if (status === 'archived') next.archivedAt = p.archivedAt ?? now;
          return next;
        }),
      );
      // 归档时，若之前没有完成/归档收录，也收进回顾页（长期、短期都收）
      if (status === 'archived') {
        const plan = plans.find((p) => p.id === id);
        if (plan && plan.status !== 'completed') {
          const already = collections.some((c) => c.planId === id);
          if (!already) {
            setCollections((prev) => [makeCollection(plan, 'archived', todayISO()), ...prev]);
          }
        }
      }
    };

    const completeShort = (id: string): string | undefined => {
      const plan = plans.find((p) => p.id === id);
      if (!plan || plan.kind !== 'short') return undefined;
      const today = todayISO();
      if (plan.completedDates.includes(today)) return undefined;
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id && p.kind === 'short'
            ? {
                ...p,
                completedDates: [...p.completedDates, today],
                completedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
      setLogs((prev) => [...prev, makeLog(plan, 'done')]);
      const entry = makeCollection(plan, 'completed', today);
      setCollections((prev) => [entry, ...prev]);
      return entry.id;
    };

    const completeLong = (id: string): string | undefined => {
      const plan = plans.find((p) => p.id === id);
      if (!plan || plan.kind !== 'long' || plan.status === 'completed') return undefined;
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() } : p,
        ),
      );
      setLogs((prev) => [...prev, makeLog(plan, 'done')]);
      const entry = makeCollection(plan, 'completed', todayISO());
      setCollections((prev) => [entry, ...prev]);
      return entry.id;
    };

    const deferShort = (id: string) => {
      const plan = plans.find((p) => p.id === id);
      if (!plan || plan.kind !== 'short') return;
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id && p.kind === 'short'
            ? { ...p, deferredTo: addDays(todayISO(), 1) }
            : p,
        ),
      );
      setLogs((prev) => [...prev, makeLog(plan, 'deferred')]);
    };

    const skipShort = (id: string) => {
      const plan = plans.find((p) => p.id === id);
      if (!plan || plan.kind !== 'short') return;
      const today = todayISO();
      if (plan.skippedDates.includes(today)) return;
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id && p.kind === 'short'
            ? { ...p, skippedDates: [...p.skippedDates, today] }
            : p,
        ),
      );
      setLogs((prev) => [...prev, makeLog(plan, 'skipped')]);
    };

    const toggleMilestone = (planId: string, milestoneId: string) => {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === planId && p.kind === 'long'
            ? {
                ...p,
                milestones: p.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, done: !m.done } : m,
                ),
              }
            : p,
        ),
      );
    };

    const updateSettings = (patch: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    };

    // ---- 日记 ----
    const addDiary = (input: { date: string; text: string; imageIds: string[] }) => {
      const now = new Date().toISOString();
      const entry: DiaryEntry = {
        id: uid(),
        date: input.date,
        text: input.text,
        imageIds: input.imageIds,
        createdAt: now,
        updatedAt: now,
      };
      setDiary((prev) => ({ ...prev, entries: [entry, ...prev.entries] }));
    };

    const updateDiary = (entry: DiaryEntry) => {
      setDiary((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === entry.id ? entry : e)),
      }));
    };

    const deleteDiary = (id: string) => {
      const target = diary.entries.find((e) => e.id === id);
      if (target?.imageIds.length) {
        void Promise.all(target.imageIds.map((imgId) => imageStore.delete(imgId))).catch(() => {
          /* 图片删除失败不阻塞 */
        });
      }
      setDiary((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== id),
      }));
    };

    // ---- 灵感 ----
    const addInspiration = (text: string) => {
      const t = text.trim();
      if (!t) return;
      const item: Inspiration = { id: uid(), text: t, createdAt: new Date().toISOString() };
      setDiary((prev) => ({ ...prev, inspirations: [item, ...prev.inspirations] }));
    };

    const deleteInspiration = (id: string) => {
      setDiary((prev) => ({
        ...prev,
        inspirations: prev.inspirations.filter((i) => i.id !== id),
      }));
    };

    // ---- 语录集 ----
    const addQuote = (scene: QuoteScene, text: string) => {
      const t = text.trim();
      if (!t) return;
      setQuotes((prev) => [...prev, { id: uid(), scene, text: t }]);
    };

    const updateQuote = (id: string, scene: QuoteScene, text: string) => {
      const t = text.trim();
      if (!t) return;
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, scene, text: t } : q)));
    };

    const deleteQuote = (id: string) => {
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    };

    /** 从语录集随机取一句（可按场景过滤）；该场景为空时返回空串 */
    const randomQuote = (scene: QuoteScene, exclude?: string): string => {
      const list = quotes.filter((q) => q.scene === scene).map((q) => q.text);
      if (list.length === 0) return '';
      if (list.length === 1) return list[0];
      const candidates = exclude ? list.filter((t) => t !== exclude) : list;
      const picked = candidates[Math.floor(Math.random() * candidates.length)];
      return picked ?? list[0];
    };

    // ---- 完成收录集 ----
    const updateCollection = (id: string, patch: { note?: string; imageIds?: string[] }) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                note: patch.note !== undefined ? patch.note : c.note,
                imageIds: patch.imageIds !== undefined ? patch.imageIds : c.imageIds,
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    };

    const deleteCollection = (id: string) => {
      const target = collections.find((c) => c.id === id);
      if (target?.imageIds.length) {
        void Promise.all(target.imageIds.map((imgId) => imageStore.delete(imgId))).catch(() => {
          /* 图片删除失败不阻塞 */
        });
      }
      setCollections((prev) => prev.filter((c) => c.id !== id));
    };

    const exportJSON = () => {
      return JSON.stringify(
        buildExport(plans, logs, settings, quotes, diary, collections),
        null,
        2,
      );
    };

    const importJSON = (raw: string): { ok: boolean; message: string } => {
      const res = parseImport(raw);
      if (!res.ok) return res;
      setPlans(res.data.plans);
      setLogs(res.data.logs);
      setSettings((prev) => ({ ...prev, ...res.data.settings }));
      if (res.data.quotes && res.data.quotes.length > 0) {
        setQuotes(res.data.quotes);
      }
      if (res.data.diary) {
        setDiary({
          entries: res.data.diary.entries,
          inspirations: res.data.diary.inspirations,
          quoteFavs: res.data.diary.quoteFavs,
        });
      }
      if (res.data.collections) {
        setCollections(res.data.collections);
      }
      return { ok: true, message: '导入成功，数据已更新。' };
    };

    const clearAll = () => {
      setPlans([]);
      setLogs([]);
      setSettings(DEFAULT_SETTINGS);
      setDiary({ entries: [], inspirations: [], quoteFavs: [] });
      quoteRepo.reset();
      setQuotes(() => quoteRepo.load());
      collectionRepo.reset();
      setCollections([]);
      setReviewFocusId(null);
      void imageStore.clearAll().catch(() => {
        /* 忽略 */
      });
    };

    return {
      plans,
      longPlans,
      shortPlans,
      logs,
      settings,
      diary,
      diaryEntries: diary.entries,
      inspirations: diary.inspirations,
      quotes,
      collections,
      reviewFocusId,
      setReviewFocus: setReviewFocusId,
      addPlan,
      updatePlan,
      deletePlan,
      setStatus,
      completeShort,
      completeLong,
      deferShort,
      skipShort,
      toggleMilestone,
      updateSettings,
      addDiary,
      updateDiary,
      deleteDiary,
      addInspiration,
      deleteInspiration,
      addQuote,
      updateQuote,
      deleteQuote,
      randomQuote,
      updateCollection,
      deleteCollection,
      exportJSON,
      importJSON,
      clearAll,
    };
  }, [plans, logs, settings, diary, quotes, collections]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp 必须在 AppProvider 内使用');
  return ctx;
}

export { APP_NAME, APP_VERSION };
