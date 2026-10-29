import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

/** 底部弹层（新建 / 编辑计划） */
export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="anim-fade absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      <div className="anim-sheet absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[28px] bg-card shadow-soft-lg">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="text-[17px] font-bold">{title ?? ''}</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost !min-h-[40px] !w-[40px] !rounded-full !p-0"
            aria-label="关闭"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div
          className="no-scrollbar max-h-[76vh] overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
