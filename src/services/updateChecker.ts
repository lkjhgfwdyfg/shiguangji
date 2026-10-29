// ============ 检查更新 ============
// 原则：不催收、不打扰。更新是选项，不是命令。
// - 启动时自动检查一次（每天至多一次，失败静默）
// - 设置页可手动检查
// - 弹窗可勾选「不再提醒这个版本」，勾选后该版本不再自动弹

/**
 * 更新清单地址（GitHub 仓库托管，经 jsDelivr CDN 分发）。
 * 开源默认留空：不检查更新、静默跳过。
 * 如需启用自动更新，替换为你自己的 update.json 地址，部署步骤见 README「如何发布新版本」。
 */
export const UPDATE_MANIFEST_URL = '';

export interface UpdateInfo {
  /** 最新版本号，如 0.5.0 */
  latest: string;
  /** 更新说明（温和文案） */
  notes: string[];
  /** APK 下载地址 */
  apkUrl: string;
  /** 发布日期 */
  publishedAt?: string;
}

const DISMISS_KEY = 'youplan.dismissedUpdates';
const LAST_AUTO_KEY = 'youplan.lastAutoCheck';

/** 版本号比较：0.5.0 > 0.4.1，返回 true 表示 a 比 b 新 */
export function isNewerVersion(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

/** 拉取远程更新清单；网络失败或未配置地址时返回 null（静默） */
export async function fetchUpdateManifest(
  timeoutMs = 8000,
): Promise<UpdateInfo | null> {
  if (!UPDATE_MANIFEST_URL) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    // 绕过 WebView/HTTP 缓存：每次真实回源，避免拿到旧的清单
    const url = `${UPDATE_MANIFEST_URL}?t=${Date.now()}`;
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data.latest !== 'string' || typeof data.apkUrl !== 'string') {
      return null;
    }
    return {
      latest: data.latest,
      notes: Array.isArray(data.notes) ? data.notes.map(String) : [],
      apkUrl: data.apkUrl,
      publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : undefined,
    };
  } catch {
    return null;
  }
}

/** 该版本是否已被用户勾选「不再提醒」 */
export function isVersionDismissed(version: string): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw) as Record<string, boolean>;
    return map[version] === true;
  } catch {
    return false;
  }
}

/** 勾选「不再提醒这个版本」 */
export function dismissVersion(version: string): void {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    map[version] = true;
    localStorage.setItem(DISMISS_KEY, JSON.stringify(map));
  } catch {
    /* 忽略存储异常 */
  }
}

/** 今天是否已经自动检查过（每天至多自动弹一次） */
export function hasAutoCheckedToday(): boolean {
  try {
    return localStorage.getItem(LAST_AUTO_KEY) === new Date().toISOString().slice(0, 10);
  } catch {
    return false;
  }
}

export function markAutoCheckedToday(): void {
  try {
    localStorage.setItem(LAST_AUTO_KEY, new Date().toISOString().slice(0, 10));
  } catch {
    /* 忽略 */
  }
}

/**
 * 在 App 内部下载更新包（不跳浏览器）。
 * Android WebView 会把带 download 属性的链接交给系统下载器：
 * 下载在系统通知栏显示进度，完成后点通知即可安装。
 * 网页版则在浏览器下载目录下载，同样是下载而不是跳页。
 */
export function openUpdateUrl(url: string): void {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shiguang-update.apk';
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    /* 兜底：新窗口打开 */
    try {
      window.open(url, '_blank');
    } catch {
      /* 忽略 */
    }
  }
}

interface NativeUpdatePlugin {
  downloadAndInstall?: (o: { url: string }) => Promise<unknown>;
  addListener?: (
    evt: string,
    cb: (e: { progress?: number }) => void,
  ) => Promise<{ remove: () => void }>;
}

function nativeUpdatePlugin(): NativeUpdatePlugin | undefined {
  const cap = (window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Record<string, NativeUpdatePlugin> };
  }).Capacitor;
  if (!cap?.isNativePlatform?.() || !cap.isNativePlatform()) return undefined;
  return cap.Plugins?.UpdateInstaller;
}

/**
 * App 内下载更新包（原生插件版，带实时进度）：
 * 打包 App 里用 UpdateInstaller 插件下载并拉起系统安装界面；
 * 网页版回退为普通下载。
 * @returns 'installing' 表示已走 App 内安装流程；'started' 表示回退到网页下载
 */
export function startAppUpdate(
  url: string,
  onProgress: (pct: number) => void,
): Promise<'installing' | 'started'> {
  const plugin = nativeUpdatePlugin();
  const doInstall = plugin?.downloadAndInstall;
  if (doInstall) {
    const listen = plugin?.addListener;
    return new Promise((resolve, reject) => {
      let removeListener: (() => void) | undefined;
      if (listen) {
        listen('downloadProgress', (e) => {
          onProgress(Math.max(0, Math.min(100, Math.round(e.progress ?? 0))));
        })
          .then((h) => {
            removeListener = h.remove;
          })
          .catch(() => {
            /* 监听失败不阻塞下载 */
          });
      }
      doInstall({ url })
        .then(() => {
          removeListener?.();
          resolve('installing');
        })
        .catch((err: unknown) => {
          removeListener?.();
          reject(err);
        });
    });
  }
  openUpdateUrl(url);
  return Promise.resolve('started');
}
