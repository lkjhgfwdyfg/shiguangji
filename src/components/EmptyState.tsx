import { SunIcon } from './icons';

interface EmptyStateProps {
  icon?: 'sun' | 'list';
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** 温柔的空白状态 */
export function EmptyState({ icon = 'sun', title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="anim-rise card flex flex-col items-center px-8 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
        {icon === 'sun' ? <SunIcon size={26} /> : <SunIcon size={26} />}
      </div>
      <p className="mt-4 text-[15px] font-semibold">{title}</p>
      {subtitle && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
