import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CollectionDetail } from '../components/CollectionDetail';
import { todayISO, weekDates, weekDayShort, isSameMonth, formatDateCN } from '../utils/date';
import { imageStore } from '../storage/IndexedDBImageStore';

/** 收录列表里的第一张图缩略图 */
function FirstThumb({ imageIds }: { imageIds: string[] }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const first = imageIds[0];
  useEffect(() => {
    if (!first) {
      setDataUrl(null);
      return;
    }
    let alive = true;
    void imageStore.get(first).then((url) => {
      if (alive) setDataUrl(url);
    });
    return () => {
      alive = false;
    };
  }, [first]);
  if (!dataUrl) return null;
  return (
    <div className="thumb-tile h-[64px] w-[64px] shrink-0 self-start">
      <img src={dataUrl} alt="" />
    </div>
  );
}

export function ReviewPage() {
  const { logs, longPlans, settings, randomQuote, collections, reviewFocusId, setReviewFocus } =
    useApp();
  const today = todayISO();
  const openQuote = useMemo(() => randomQuote('review'), [today, randomQuote]);
  const [viewingId, setViewingId] = useState<string | null>(null);

  // 从今日页「去记录」跳来时，自动打开对应收录
  useEffect(() => {
    if (reviewFocusId) {
      setViewingId(reviewFocusId);
      setReviewFocus(null);
    }
  }, [reviewFocusId, setReviewFocus]);

  const thisWeek = useMemo(() => weekDates(today), [today]);
  const weekChoices = useMemo(
    () => logs.filter((l) => thisWeek.includes(l.date)).length,
    [logs, thisWeek],
  );

  const monthGoals = useMemo(() => {
    const doneIds = new Set(
      logs.filter((l) => l.kind === 'done' && isSameMonth(l.date, today)).map((l) => l.planId),
    );
    return doneIds.size;
  }, [logs, today]);

  const perDay = useMemo(
    () =>
      thisWeek.map((d) => ({
        date: d,
        count: logs.filter((l) => l.date === d).length,
      })),
    [logs, thisWeek],
  );

  const activeLongs = longPlans.filter((p) => p.status === 'active');
  const maxCount = Math.max(1, ...perDay.map((d) => d.count));

  // 完成收录集：按完成日期倒序
  const sortedCollections = useMemo(
    () =>
      [...collections].sort((a, b) =>
        a.date === b.date ? (a.createdAt < b.createdAt ? 1 : -1) : a.date < b.date ? 1 : -1,
      ),
    [collections],
  );

  const viewing = collections.find((c) => c.id === viewingId) ?? null;
  if (viewing) {
    return (
      <main className="page-pad-bottom mx-auto max-w-md px-5 pt-[calc(20px+env(safe-area-inset-top))]">
        <CollectionDetail collection={viewing} onBack={() => setViewingId(null)} />
      </main>
    );
  }

  return (
    <main className="page-pad-bottom mx-auto max-w-md px-5 pt-[calc(20px+env(safe-area-inset-top))]">
      <header className="anim-rise">
        <h1 className="text-[22px] font-bold">回顾</h1>
        <p className="mt-1 text-[13.5px] text-muted">只看你为自己做了多少，不做评判。</p>
      </header>

      {settings.dailyQuote && openQuote && (
        <p className="anim-rise mt-3 rounded-card bg-accent-soft px-4 py-3 text-[14px] leading-relaxed text-accent-deep">
          {openQuote}
        </p>
      )}

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="anim-rise card p-5">
          <p className="text-[12.5px] font-semibold text-muted">这周的选择</p>
          <p className="mt-2 text-[26px] font-bold text-accent-deep">{weekChoices}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            这周你为自己做了 {weekChoices} 次选择。
          </p>
        </div>
        <div className="anim-rise card p-5">
          <p className="text-[12.5px] font-semibold text-muted">这个月靠近的目标</p>
          <p className="mt-2 text-[26px] font-bold text-accent-deep">{monthGoals}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            {monthGoals > 0
              ? `这个月，你在 ${monthGoals} 个目标上留下了脚印。`
              : '慢慢来，第一个脚印会出现的。'}
          </p>
        </div>
      </section>

      <section className="anim-rise card mt-4 p-5">
        <p className="text-[13px] font-semibold">本周的轻轻记录</p>
        <div className="mt-4 flex items-end justify-between gap-1">
          {perDay.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-16 w-full items-end justify-center rounded-full bg-soft">
                <div
                  className="w-3 rounded-full bg-accent transition-all duration-500"
                  style={{
                    height: `${Math.max(8, (d.count / maxCount) * 56)}px`,
                    opacity: d.count === 0 ? 0.25 : 0.85,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-muted">{weekDayShort(d.date)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[12px] text-muted">
          {weekChoices > 0 ? '每一天的选择，都在为你自己积攒温柔。' : '这周还没有记录，不着急。'}
        </p>
      </section>

      {activeLongs.length > 0 && (
        <section className="anim-rise card mt-4 p-5">
          <p className="text-[13px] font-semibold">正在靠近的目标</p>
          <ul className="mt-3 space-y-3">
            {activeLongs.map((p) => {
              const done = p.milestones.filter((m) => m.done).length;
              const total = p.milestones.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <li key={p.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium">{p.title}</span>
                    {total > 0 && <span className="text-[12px] text-muted">{pct}%</span>}
                  </div>
                  {total > 0 && (
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-soft">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 完成收录集 */}
      <section className="anim-rise mt-4">
        <div className="flex items-baseline justify-between px-1">
          <p className="text-[15px] font-bold">完成收录集 · {sortedCollections.length} 件事</p>
          <span className="text-[12px] text-muted">完成的事都收在这里</span>
        </div>
        {sortedCollections.length === 0 ? (
          <div className="card mt-2.5 p-5">
            <p className="text-[13.5px] font-semibold">还没有收录</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              完成第一件小事后，它会自动收进来。可以补一段文字，也可以贴张照片。
            </p>
          </div>
        ) : (
          <div className="mt-2.5 space-y-2.5">
            {sortedCollections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setViewingId(c.id)}
                className="anim-rise card block w-full p-4 text-left transition-transform active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14.5px] font-bold">{c.planTitle}</p>
                      <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-deep">
                        {c.kind === 'archived' ? '归档' : '完成'}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-muted">{formatDateCN(c.date)}</p>
                    {c.note ? (
                      <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink/90">
                        {c.note}
                      </p>
                    ) : (
                      <span className="mt-1.5 inline-flex items-center rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent-deep">
                        补一段记录
                      </span>
                    )}
                  </div>
                  <FirstThumb imageIds={c.imageIds} />
                </div>
              </button>
            ))}
          </div>
        )}
        <p className="mt-3 px-1 text-center text-[12px] text-muted">
          每完成一件事，都会自动收在这里。
        </p>
      </section>
    </main>
  );
}
