// 轻量内联 SVG 图标集（无外部依赖）

interface IconProps {
  size?: number;
  className?: string;
}

function baseProps(size = 22, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
}

export function SunIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.2M12 19v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.8 12H5M19 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </svg>
  );
}

export function ListIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M8.5 6h11M8.5 12h11M8.5 18h11" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth={2.4} />
    </svg>
  );
}

export function HeartIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.7 3.6 5 6.4 5c1.9 0 3.6 1.1 4.4 2.7h2.4C14 6.1 15.7 5 17.6 5c2.8 0 4.9 2.7 3.7 5.8C19.5 15.4 12 20 12 20z" />
    </svg>
  );
}

export function GearIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
    </svg>
  );
}

export function PlusIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CloseIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CheckIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4.5 12.5l5 5L19.5 7" />
    </svg>
  );
}

export function PencilIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" />
    </svg>
  );
}

export function PauseIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M9 5.5v13M15 5.5v13" strokeWidth={2.2} />
    </svg>
  );
}

export function PlayIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M8.5 5.8v12.4L18 12 8.5 5.8z" />
    </svg>
  );
}

export function ArchiveIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 8h16v12H4zM3 4h18v4H3zM10 12h4" />
    </svg>
  );
}

export function TrashIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
    </svg>
  );
}

export function ChevronDownIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  );
}

export function CoffeeIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 9h12v5.5a4.5 4.5 0 0 1-4.5 4.5h-3A4.5 4.5 0 0 1 4 14.5V9z" />
      <path d="M16 10.5h1.5A2.5 2.5 0 0 1 20 13v.5a2.5 2.5 0 0 1-2.5 2.5H16M8 4.5v2M11 4.5v2M14 4.5v2" />
    </svg>
  );
}

export function MoonIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  );
}

export function BellIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6zM10 19.5a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

export function BookIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </svg>
  );
}

/** 实心小星星（目标胶囊等装饰用，纯矢量，不依赖字体） */
export function StarIcon({ size, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden
    >
      <path d="M12 3.2l2.6 5.3 5.9.9-4.3 4.1 1 5.9L12 16.9l-5.2 2.5 1-5.9L3.5 9.4l5.9-.9z" />
    </svg>
  );
}

/** 书签（收藏语录用，未收藏=描边，已收藏=实心） */
export function BookmarkIcon({ size, className, filled }: IconProps & { filled?: boolean }) {
  const p = 'M6.5 4.5h11V20L12 16.2 6.5 20V4.5z';
  if (filled) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        className={className}
        aria-hidden
      >
        <path d={p} />
      </svg>
    );
  }
  return (
    <svg {...baseProps(size, className)}>
      <path d={p} />
    </svg>
  );
}
