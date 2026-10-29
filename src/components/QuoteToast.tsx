import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { HeartIcon } from './icons';

const ToastCtx = createContext<(text: string) => void>(() => {});

export const useToast = () => useContext(ToastCtx);

/** 温柔的激励语录浮层（完成 / 顺延 / 跳过时出现，约 3 秒后消失） */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((t: string) => {
    setText(t);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setText(null), 3400);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {text && (
        <div className="quote-toast anim-toast" role="status">
          <HeartIcon size={18} className="text-accent shrink-0" />
          <span>{text}</span>
        </div>
      )}
    </ToastCtx.Provider>
  );
}
