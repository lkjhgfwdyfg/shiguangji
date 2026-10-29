import { useState } from 'react';
import type { ShortPlan, PlanStatus } from '../types/models';
import { shortDateLabel } from '../utils/plan';
import {
  ArchiveIcon,
  CheckIcon,
  ChevronDownIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  TrashIcon,
} from './icons';

interface ShortPlanItemProps {
  plan: ShortPlan;
  today: string;
  onEdit: () => void;
  onComplete: () => void;
  onDefer: () => void;
  onSkip: () => void;
  onStatusChange: (status: PlanStatus) => void;
  onDelete: () => void;
}

const STATUS_TEXT: Record<ShortPlan['status'], string> = {
  active: '进行中',
  paused: '暂停',
  completed: '已完成',
  archived: '已归档',
};

/** 短期计划列表项 */
export function ShortPlanItem({
  plan,
  today,
  onEdit,
  onComplete,
  onDefer,
  onSkip,
  onStatusChange,
  onDelete,
}: ShortPlanItemProps) {
  const [expanded, setExpanded] = useState(false);
  const doneToday = plan.completedDates.includes(today);
  const hasDetail = plan.steps.length > 0 || !!plan.notes;

  return (
    <div className="anim-rise card p-5">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold">{plan.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="badge">{shortDateLabel(plan, today)}</span>
            {plan.durationMin ? <span className="badge">约 {plan.durationMin} 分钟</span> : null}
            {plan.steps.length > 0 ? <span className="badge">{plan.steps.length} 个步骤</span> : null}
            {doneToday && <span className="badge !bg-accent-soft !text-accent-deep">今天已完成</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={[
              'rounded-full px-2.5 py-1 text-[11px] font-semibold',
              plan.status === 'active'
                ? 'bg-accent-soft text-accent-deep'
                : plan.status === 'completed'
                  ? 'bg-accent-soft text-accent-deep'
                  : 'bg-soft text-muted',
            ].join(' ')}
          >
            {STATUS_TEXT[plan.status]}
          </span>
          <ChevronDownIcon
            size={18}
            className={`text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="anim-rise mt-4 space-y-4">
          {hasDetail && (
            <div className="rounded-2xl bg-soft p-4">
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

          <div className="flex flex-wrap gap-2">
            {plan.status === 'active' && !doneToday && (
              <>
                <button type="button" className="btn btn-soft" onClick={onComplete}>
                  <CheckIcon size={15} /> 补记完成
                </button>
                <button type="button" className="btn btn-ghost" onClick={onDefer}>
                  顺延到明天
                </button>
                <button type="button" className="btn btn-ghost" onClick={onSkip}>
                  今天先跳过
                </button>
              </>
            )}
            <button type="button" className="btn btn-ghost" onClick={onEdit}>
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
