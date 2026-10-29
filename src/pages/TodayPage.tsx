import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/QuoteToast';
import { TodayCard } from '../components/TodayCard';
import { SunIcon, StarIcon, BookmarkIcon, CloseIcon } from '../components/icons';
import { todayISO, todayLabel, greeting, addDays, weekdayCN } from '../utils/date';
import { isDueToday, todayCardState } from '../utils/plan';

export function TodayPage() {
  const {
    shortPlans,
    longPlans,
    completeShort,
    deferShort,
    skipShort,
    deletePlan,
    addPlan,
    settings,
    randomQuote,
    setReviewFocus,
  } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const today = todayISO();
  const tomorrow = addDays(today, 1);

  // 语录：点击即换一句（无任何提示文案）
  const [quote, setQuote] = useState(() => randomQuote('open'));

  // 完成后的温柔引导：可去回顾页给这件事补记录
  const [guide, setGuide] = useState<{ id: string; title: string } | null>(null);

  const activeLongCount = longPlans.filter((p) => p.status === 'active').length;
  const duePlans = shortPlans.filter((p) => isDueToday(p, today));

  // 明天的打算：明天日期的短期计划（尚未完成的），以"小纸条"形式展示
  const tomorrowPlans = shortPlans.filter(
    (p) =>
      p.status === 'active' &&
      p.repeat === 'none' &&
      p.date === tomorrow &&
      !p.completedDates.includes(tomorrow) &&
      !p.skippedDates.includes(tomorrow),
  );
  const [tomorrowInput, setTomorrowInput] = useState('');

  const handleQuoteTap = () => {
    setQuote((prev) => randomQuote('open', prev));
  };

  const handleDone = (id: string) => {
    const collId = completeShort(id);
    const title = shortPlans.find((p) => p.id === id)?.title ?? '';
    toast(randomQuote('done') || '做了一点，真好。');
    if (collId) setGuide({ id: collId, title });
  };
  const handleLater = () => {
    toast('好的，稍后再想也没关系。');
  };
  const handleSkip = (id: string) => {
    skipShort(id);
    toast(randomQuote('skip') || '今天先休息，也没关系。');
  };
  const handleDefer = (id: string) => {
    deferShort(id);
    toast(randomQuote('defer') || '明天见，它会在那里等你。');
  };

  const handleGuideGo = () => {
    if (!guide) return;
    setReviewFocus(guide.id);
    setGuide(null);
    navigate('/review');
  };

  const handleAddTomorrow = () => {
    const title = tomorrowInput.trim();
    if (!title) return;
    addPlan('short', { title, date: tomorrow, repeat: 'none', steps: [], notes: '' });
    setTomorrowInput('');
    toast('记下了，明天见。');
  };

  const handleRemoveTomorrow = (id: string) => {
    deletePlan(id);
    toast('已经从明天的打算里放下了。');
  };

  return (
    <main className="page-pad-bottom mx-auto max-w-md px-5 pt-[calc(20px+env(safe-area-inset-top))]">
      <header className="anim-rise">
        <h1 className="text-[22px] font-bold">{greeting()}</h1>
        <p className="mt-1 text-[13.5px] text-muted">{todayLabel()}</p>
        {settings.dailyQuote && quote && (
          <div className="mt-3 flex items-start gap-2">
            <button
              type="button"
              onClick={handleQuoteTap}
              className="quote-tap flex-1 rounded-card bg-accent-soft px-4 py-3 text-left text-[14px] leading-relaxed text-accent-deep"
              aria-label="换一句鼓励"
            >
              <span key={quote} className="anim-quote block">
                {quote}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/quotes')}
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep transition-transform active:scale-90"
              aria-label="打开语录集"
            >
              <BookmarkIcon size={17} />
            </button>
          </div>
        )}
      </header>

      {activeLongCount > 0 && (
        <div className="anim-rise mt-5 flex items-center gap-2.5 rounded-full bg-accent-soft px-4 py-2.5">
          <StarIcon size={15} className="shrink-0 text-accent-deep" />
          <p className="text-[13px] font-semibold text-accent-deep">在路上的目标 · {activeLongCount}</p>
          <span className="mx-1 h-3.5 w-px bg-accent-deep/20" />
          <p className="min-w-0 flex-1 truncate text-[12px] text-muted">每个都值得慢慢来</p>
        </div>
      )}

      <section className="mt-4 space-y-4">
        {duePlans.length === 0 ? (
          <div className="anim-rise card flex flex-col items-center px-8 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
              <SunIcon size={26} />
            </div>
            <p className="mt-4 text-[15px] font-semibold">今天没有必须做的事</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              可以好好休息，或随手做一件喜欢的小事。
            </p>
          </div>
        ) : (
          duePlans.map((plan) => (
            <TodayCard
              key={plan.id}
              plan={plan}
              state={todayCardState(plan, today)}
              onDone={() => handleDone(plan.id)}
              onLater={handleLater}
              onSkip={() => handleSkip(plan.id)}
              onDefer={() => handleDefer(plan.id)}
            />
          ))
        )}
      </section>

      {/* 明天的打算 */}
      <section className="anim-rise mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold">明天的打算</h2>
          <span className="text-[12px] text-muted">明天 {weekdayCN(tomorrow)}</span>
        </div>
        <p className="mt-1 text-[12px] text-muted">明天到了，会自动出现在今日卡片里。</p>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={tomorrowInput}
            onChange={(e) => setTomorrowInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTomorrow();
            }}
            placeholder="想一件明天做的小事…"
            className="field flex-1"
            maxLength={40}
          />
          <button
            type="button"
            onClick={handleAddTomorrow}
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-soft transition-transform active:scale-95"
            aria-label="添加明天的打算"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {tomorrowPlans.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tomorrowPlans.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[13px] font-medium shadow-soft"
              >
                {p.title}
                <button
                  type="button"
                  onClick={() => handleRemoveTomorrow(p.id)}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-soft text-muted transition-transform active:scale-90"
                  aria-label={`放下「${p.title}」`}
                >
                  <CloseIcon size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 完成后的温柔引导 */}
      {guide && (
        <div className="anim-sheet fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 px-5">
          <div className="mx-auto max-w-md rounded-[28px] bg-[#FBEED7] p-5 shadow-soft-lg">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4.5 12.5l5 5L19.5 7" />
                </svg>
              </span>
              <p className="truncate text-[15px] font-bold">{guide.title} · 完成啦，真不错。</p>
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink/80">
              要不要在回顾里，给这件事补一段文字或照片？
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setGuide(null)}
                className="btn btn-ghost flex-1"
              >
                暂不
              </button>
              <button
                type="button"
                onClick={handleGuideGo}
                className="btn btn-primary flex-1"
              >
                去记录
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
