interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 温和的确认弹窗（删除 / 清空等破坏性操作前使用） */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确定',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-8">
      <div
        className="anim-fade absolute inset-0 bg-black/30"
        onClick={onCancel}
        aria-hidden
      />
      <div className="anim-rise relative w-full max-w-xs rounded-card bg-card p-6 shadow-soft-lg">
        <h3 className="text-[16px] font-bold">{title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{message}</p>
        <div className="mt-5 flex gap-3">
          <button className="btn btn-ghost flex-1" onClick={onCancel}>
            再想想
          </button>
          <button className="btn btn-danger flex-1" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
