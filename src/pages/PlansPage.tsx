import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/QuoteToast';
import { Segmented } from '../components/Segmented';
import { PlanFormModal } from '../components/PlanFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LongPlanCard } from '../components/LongPlanCard';
import { ShortPlanItem } from '../components/ShortPlanItem';
import { PlusIcon } from '../components/icons';
import type { Plan, LongPlanInput, ShortPlanInput, PlanStatus } from '../types/models';
import { todayISO } from '../utils/date';

type Tab = 'long' | 'short';

export function PlansPage() {
  const {
    longPlans,
    shortPlans,
    addPlan,
    updatePlan,
    deletePlan,
    setStatus,
    completeShort,
    completeLong,
    deferShort,
    skipShort,
    toggleMilestone,
  } = useApp();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>('long');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Plan | undefined>(undefined);
  const today = todayISO();

  const shortTitleMap = useMemo(
    () => Object.fromEntries(shortPlans.map((p) => [p.id, p.title])),
    [shortPlans],
  );

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setFormOpen(true);
  };

  const handleSave = (kind: 'long' | 'short', input: LongPlanInput | ShortPlanInput) => {
    if (editing) {
      if (kind === 'long' && editing.kind === 'long') {
        const i = input as LongPlanInput;
        updatePlan({
          ...editing,
          title: i.title,
          why: i.why,
          period: i.period,
          milestones: i.milestones,
          relatedShortIds: i.relatedShortIds,
          notes: i.notes,
        });
      } else if (kind === 'short' && editing.kind === 'short') {
        const i = input as ShortPlanInput;
        updatePlan({
          ...editing,
          title: i.title,
          date: i.date,
          repeat: i.repeat,
          durationMin: i.durationMin,
          steps: i.steps,
          notes: i.notes,
        });
      }
      toast('改好啦。');
    } else {
      addPlan(kind, input);
      toast('已经记下啦。');
    }
    setFormOpen(false);
    setEditing(undefined);
  };

  const confirmDelete = () => {
    if (toDelete) {
      deletePlan(toDelete.id);
      toast('已经轻轻放下了。');
    }
    setToDelete(undefined);
  };

  const handleCompleteLong = (id: string) => {
    completeLong(id);
    toast(randomDone());
  };
  const handleCompleteShort = (id: string) => {
    completeShort(id);
    toast(randomDone());
  };
  const handleDeferShort = (id: string) => {
    deferShort(id);
    toast('顺延到明天，明天见。');
  };
  const handleSkipShort = (id: string) => {
    skipShort(id);
    toast('今天先跳过，没关系。');
  };

  function randomDone() {
    const list = [
      '做一点，也算数。',
      '谢谢你愿意为在意的事情花时间。',
      '小小的行动，正在悄悄靠近大大的愿望。',
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  const changeStatus = (id: string, status: PlanStatus) => {
    setStatus(id, status);
    if (status === 'paused') toast('先暂停一下，随时可以继续。');
    if (status === 'active') toast('继续出发吧。');
    if (status === 'archived') toast('已经收进回顾里了。');
  };

  return (
    <main className="page-pad-bottom mx-auto max-w-md px-5 pt-[calc(20px+env(safe-area-inset-top))]">
      <header className="anim-rise flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold">我的计划</h1>
          <p className="mt-1 text-[13.5px] text-muted">计划是选项，不是命令。</p>
        </div>
      </header>

      <div className="anim-rise mt-5">
        <Segmented
          value={tab}
          options={[
            { value: 'long', label: '长期' },
            { value: 'short', label: '短期' },
          ]}
          onChange={setTab}
        />
      </div>

      <section className="mt-4 space-y-4">
        {tab === 'long' &&
          (longPlans.length === 0 ? (
            <div className="anim-rise card flex flex-col items-center px-8 py-12 text-center">
              <p className="text-[15px] font-semibold">还没有长期计划</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                记一个惦记很久的目标，慢慢靠近它。
              </p>
            </div>
          ) : (
            longPlans.map((plan) => (
              <LongPlanCard
                key={plan.id}
                plan={plan}
                relatedTitles={plan.relatedShortIds
                  .map((id) => shortTitleMap[id])
                  .filter(Boolean)}
                onEdit={() => openEdit(plan)}
                onToggleMilestone={(mid) => toggleMilestone(plan.id, mid)}
                onComplete={() => handleCompleteLong(plan.id)}
                onStatusChange={(status) => changeStatus(plan.id, status)}
                onDelete={() => setToDelete(plan)}
              />
            ))
          ))}

        {tab === 'short' &&
          (shortPlans.length === 0 ? (
            <div className="anim-rise card flex flex-col items-center px-8 py-12 text-center">
              <p className="text-[15px] font-semibold">还没有短期计划</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                记一件今天或最近想做的事，做不做都可以。
              </p>
            </div>
          ) : (
            shortPlans.map((plan) => (
              <ShortPlanItem
                key={plan.id}
                plan={plan}
                today={today}
                onEdit={() => openEdit(plan)}
                onComplete={() => handleCompleteShort(plan.id)}
                onDefer={() => handleDeferShort(plan.id)}
                onSkip={() => handleSkipShort(plan.id)}
                onStatusChange={(status) => changeStatus(plan.id, status)}
                onDelete={() => setToDelete(plan)}
              />
            ))
          ))}
      </section>

      {/* 新建按钮 */}
      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-soft-lg transition-transform active:scale-95"
        aria-label="新建计划"
      >
        <PlusIcon size={24} />
      </button>

      <PlanFormModal
        open={formOpen}
        kind={tab}
        initial={editing}
        shortPlans={shortPlans}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="删除这个计划？"
        message="删除后不会恢复。放心，它已经好好陪你走过一段了。"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />
    </main>
  );
}
