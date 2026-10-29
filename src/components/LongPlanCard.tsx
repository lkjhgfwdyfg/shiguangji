import { useState } from 'react';
import type { LongPlan, PlanStatus } from '../types/models';
import {
  ArchiveIcon,
  CheckIcon,
  ChevronDownIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  TrashIcon,
} from './icons';

interface LongPlanCardProps {
  plan: LongPlan;
  relatedTitles: string[];
  onEdit: () => void;
  onToggleMilestone: (milestoneId: string) => void;
  onComplete: () => void;
  onStatusChange: (status: PlanStatus) => void;
  onDelete: () => void;
}

const STATUS_DOT: Record<LongPlan['status'], string> = {
  active: 'bg-accent',
  paused: 'bg-accent-2',
  completed: 'bg-accent-3',
  archived: 'bg-line',
};

/** 长期计划卡片 */
export function LongPlanCard({
  plan,
  relatedTitles,
  onEdit,
  onToggleMilestone,
  onComplete,
  onStatusChange,
  onDelete,
}: LongPlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const done = plan.milestones.filter((m) => m.done).length;
  const total = plan.milestones.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="anim-rise card p-5">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[plan.status]}`} />
            <p className="truncate text-[16px] font-bold">{plan.title}</p>
          </div>
          {plan.period && <p className="mt-1 text-[12.5px] text-muted">期望 {plan.period}</p>}
          {plan.why && <p className="line-clamp-2 mt-1.5 text-[13px] leading-relaxed text-muted">{plan.why}</p>}
        </div>
        <ChevronDownIcon
          size={18}
          className={`mt-1 shrink-0 text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="anim-rise mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-muted">阶段</span>
              {total > 0 && (
                <span className="text-[12.5px] font-semibold text-muted">
                  {done} / {total}
                </span>
              )}
            </div>
            {total > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {plan.milestones.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {plan.milestones.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-xl px-1 py-2 text-left"
                      onClick={() => onToggleMilestone(m.id)}
                    >
                      <span
                        className={[
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                          m.done ? 'border-accent-3 bg-accent-3 text-white' : 'border-line text-transparent',
                        ].join(' ')}
                      >
                        <CheckIcon size={12} />
                      </span>
                      <span className={m.done ? 'text-[14px] text-muted' : 'text-[14px]'}>{m.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-muted">还没有阶段，可以编辑添加。</p>
            )}
          </div>

          {relatedTitles.length > 0 && (
            <div>
              <p className="text-[12.5px] font-semibold text-muted">关联的短期行动</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedTitles.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-soft" onClick={onEdit}>
              <PencilIcon size={15} /> 编辑
            </button>
            {plan.status === 'active' ? (
              <button type="button" className="btn btn-ghost" onClick={() => onStatusChange('paused')}>
                <PauseIcon size={15} /> 暂停
              </button>
            ) : plan.status === 'paused' ? (
              <button type="button" className="btn btn-ghost" onClick={() => onStatusChange('active')}>
                <PlayIcon size={15} /> 继续
              </button>
            ) : null}
            {plan.status !== 'completed' && (
              <button type="button" className="btn btn-soft" onClick={onComplete}>
                <CheckIcon size={15} /> 标记完成
              </button>
            )}
            {plan.status !== 'archived' && plan.status !== 'completed' && (
              <button type="button" className="btn btn-ghost" onClick={() => onStatusChange('archived')}>
                <ArchiveIcon size={15} /> 归档
              </button>
            )}
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              <TrashIcon size={15} /> 删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
