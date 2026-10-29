import { useEffect, useState } from 'react';
import type {
  LongPlanInput,
  ShortPlanInput,
  ShortPlan,
  Plan,
  LongPlan,
  RepeatRule,
  Milestone,
} from '../types/models';
import { Modal } from './Modal';
import { Segmented } from './Segmented';
import { PlusIcon, CloseIcon, CheckIcon } from './icons';
import { uid } from '../utils/id';
import { todayISO } from '../utils/date';

interface PlanFormModalProps {
  open: boolean;
  kind: 'long' | 'short';
  initial?: Plan;
  shortPlans: ShortPlan[];
  onClose: () => void;
  onSave: (kind: 'long' | 'short', input: LongPlanInput | ShortPlanInput) => void;
}

/** 新建 / 编辑计划（底部弹层表单） */
export function PlanFormModal({
  open,
  kind,
  initial,
  shortPlans,
  onClose,
  onSave,
}: PlanFormModalProps) {
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [period, setPeriod] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [date, setDate] = useState(todayISO());
  const [repeat, setRepeat] = useState<RepeatRule>('none');
  const [durationMin, setDurationMin] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (initial && initial.kind === 'long') {
      const p = initial as LongPlan;
      setTitle(p.title);
      setWhy(p.why);
      setPeriod(p.period);
      setMilestones(p.milestones);
      setRelatedIds(p.relatedShortIds);
      setNotes(p.notes ?? '');
      setSteps([]);
      setDate(todayISO());
      setRepeat('none');
      setDurationMin('');
    } else if (initial && initial.kind === 'short') {
      const p = initial as ShortPlan;
      setTitle(p.title);
      setDate(p.date);
      setRepeat(p.repeat);
      setDurationMin(p.durationMin ? String(p.durationMin) : '');
      setSteps(p.steps);
      setNotes(p.notes ?? '');
      setWhy('');
      setPeriod('');
      setMilestones([]);
      setRelatedIds([]);
    } else {
      setTitle('');
      setWhy('');
      setPeriod('');
      setMilestones([]);
      setRelatedIds([]);
      setDate(todayISO());
      setRepeat('none');
      setDurationMin('');
      setSteps([]);
      setNotes('');
    }
  }, [open, initial]);

  const submit = () => {
    if (!title.trim()) {
      setError('给这件事起个名字吧。');
      return;
    }
    if (kind === 'long') {
      const clean = milestones
        .map((m) => ({ ...m, title: m.title.trim() }))
        .filter((m) => m.title);
      onSave('long', {
        title: title.trim(),
        why: why.trim(),
        period: period.trim(),
        milestones: clean,
        relatedShortIds: relatedIds,
        notes: notes.trim() || undefined,
      });
    } else {
      if (!date) {
        setError('选一个日期吧。');
        return;
      }
      let duration: number | undefined;
      if (durationMin.trim()) {
        const n = Number(durationMin);
        duration = Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
      }
      onSave('short', {
        title: title.trim(),
        date,
        repeat,
        durationMin: duration,
        steps: steps.map((s) => s.trim()).filter(Boolean),
        notes: notes.trim() || undefined,
      });
    }
  };

  const toggleRelated = (id: string) => {
    setRelatedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const titleText = initial
    ? kind === 'long'
      ? '编辑长期计划'
      : '编辑短期计划'
    : kind === 'long'
      ? '新建长期计划'
      : '新建短期计划';

  return (
    <Modal open={open} title={titleText} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-muted">
            {kind === 'long' ? '目标' : '任务或习惯'}
          </label>
          <input
            className="field"
            placeholder={kind === 'long' ? '比如：学会游泳' : '比如：散步 20 分钟'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {kind === 'long' ? (
          <>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-muted">为什么想做</label>
              <textarea
                className="field"
                placeholder="比如：想更了解自己，或者完成一个惦记很久的心愿"
                value={why}
                onChange={(e) => setWhy(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-muted">期望周期</label>
              <input
                className="field"
                placeholder="比如：3 个月"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-muted">阶段 / 里程碑</label>
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <input
                      className="field flex-1"
                      placeholder={`阶段 ${i + 1}`}
                      value={m.title}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x)),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-ghost !min-h-[46px] !w-[46px] shrink-0 !rounded-2xl !p-0"
                      onClick={() => setMilestones((prev) => prev.filter((x) => x.id !== m.id))}
                      aria-label="删除阶段"
                    >
                      <CloseIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-soft mt-2 w-full"
                onClick={() => setMilestones((prev) => [...prev, { id: uid(), title: '', done: false }])}
              >
                <PlusIcon size={15} /> 添加一个阶段
              </button>
            </div>
            {shortPlans.length > 0 && (
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-muted">关联短期行动</label>
                <div className="flex flex-wrap gap-2">
                  {shortPlans.map((sp) => {
                    const active = relatedIds.includes(sp.id);
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => toggleRelated(sp.id)}
                        className={[
                          'flex min-h-[40px] items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                          active
                            ? 'border-accent bg-accent-soft text-accent-deep'
                            : 'border-line bg-transparent text-muted',
                        ].join(' ')}
                      >
                        {active && <CheckIcon size={13} />}
                        {sp.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-muted">日期</label>
              <input
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-muted">重复</label>
              <Segmented
                value={repeat}
                options={[
                  { value: 'none', label: '仅一次' },
                  { value: 'daily', label: '每天' },
                  { value: 'weekly', label: '每周' },
                ]}
                onChange={setRepeat}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-muted">预计时长（分钟，可选）</label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                className="field"
                placeholder="比如：30"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-muted">子步骤（可选）</label>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="field flex-1"
                      placeholder={`步骤 ${i + 1}`}
                      value={s}
                      onChange={(e) =>
                        setSteps((prev) => prev.map((x, xi) => (xi === i ? e.target.value : x)))
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-ghost !min-h-[46px] !w-[46px] shrink-0 !rounded-2xl !p-0"
                      onClick={() => setSteps((prev) => prev.filter((_, xi) => xi !== i))}
                      aria-label="删除步骤"
                    >
                      <CloseIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-soft mt-2 w-full"
                onClick={() => setSteps((prev) => [...prev, ''])}
              >
                <PlusIcon size={15} /> 添加一个步骤
              </button>
            </div>
          </>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-muted">备注（可选）</label>
          <textarea
            className="field"
            placeholder="想记点什么都可以"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

        <button type="button" className="btn btn-primary w-full" onClick={submit}>
          保存
        </button>
      </div>
    </Modal>
  );
}
