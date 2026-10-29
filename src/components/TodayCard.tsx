import { useState } from 'react';
import type { ShortPlan } from '../types/models';
import type { TodayCardState } from '../utils/plan';
import { repeatLabel } from '../utils/plan';
import { CheckIcon, ChevronDownIcon } from './icons';

interface TodayCardProps {
  plan: ShortPlan;
  state: TodayCardState;
  onDone: () => void;
  onLater: () => void;
  onSkip: () => void;
  onDefer: () => void;
}

/** 今日页卡片：今天可以选择做的事 */
export function TodayCard({ plan, state, onDone, onLater, onSkip, onDefer }: TodayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = plan.steps.length > 0 || !!plan.notes;

  if (state === 'done') {
    return (
      <div className="anim-rise card-done rounded-card p-5">
        <div className="flex items-center gap-3">
          <span className="anim-check flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-3 text-white">
            <CheckIcon size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">{plan.title}</p>
            <p className="mt-0.5 text-[13px] text-muted">今天已完成，真不错。</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'skipped') {
    return (
      <div className="anim-rise card-skipped rounded-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-muted">{plan.title}</p>
            <p className="mt-0.5 text-[13px] text-muted/80">今天先跳过，没关系。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-rise card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[16px] font-bold leading-snug">{plan.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="badge">{repeatLabel(plan.repeat)}</span>
            {plan.durationMin ? <span className="badge">约 {plan.durationMin} 分钟</span> : null}
            {plan.steps.length > 0 ? (
              <span className="badge">{plan.steps.length} 个小步骤</span>
            ) : null}
          </div>
        </div>
        {hasDetail && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="btn btn-ghost !min-h-[40px] !w-[40px] shrink-0 !rounded-full !p-0"
            aria-label={expanded ? '收起' : '展开'}
          >
            <ChevronDownIcon
              size={18}
              className={expanded ? 'rotate-180 transition-transform duration-200' : 'transition-transform duration-200'}
            />
          </button>
        )}
      </div>

      {expanded && hasDetail && (
        <div className="anim-rise mt-3 rounded-2xl bg-soft p-4">
          {plan.steps.length > 0 && (
            <ul className="space-y-2">
              {plan.steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-[13.5px] leading-snug text-ink/90">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" />
                  {s}
                </li>
              ))}
            </ul>
          )}
          {plan.notes && <p className="mt-2 text-[13px] leading-relaxed text-muted">{plan.notes}</p>}
        </div>
      )}

      <div className="mt-4">
        <button type="button" className="btn btn-primary w-full" onClick={onDone}>
          <CheckIcon size={18} /> 做到了
        </button>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button type="button" className="btn btn-ghost text-[13px]" onClick={onLater}>
            稍后
          </button>
          <button type="button" className="btn btn-ghost text-[13px]" onClick={onSkip}>
            今天先跳过
          </button>
          <button type="button" className="btn btn-ghost text-[13px]" onClick={onDefer}>
            顺延到明天
          </button>
        </div>
      </div>
    </div>
  );
}
