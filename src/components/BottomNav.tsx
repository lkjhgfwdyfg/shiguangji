import { NavLink, useLocation } from 'react-router-dom';
import { SunIcon, ListIcon, BookIcon, HeartIcon, GearIcon } from './icons';

const items = [
  { to: '/today', label: '今天', Icon: SunIcon },
  { to: '/plans', label: '计划', Icon: ListIcon },
  { to: '/record', label: '记录', Icon: BookIcon },
  { to: '/review', label: '回顾', Icon: HeartIcon },
  { to: '/settings', label: '设置', Icon: GearIcon },
];

/** 全屏子页面（语录集）不显示底部导航 */
const HIDDEN_ON = ['/quotes'];

export function BottomNav() {
  const { pathname } = useLocation();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <nav className="nav-bar">
      <div className="mx-auto flex max-w-md items-stretch">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-accent-deep' : 'text-muted',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={isActive ? 'opacity-100' : 'opacity-70'} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
