// ============ 通知适配器抽象 ============
// 原则：不催收、不轰炸。通知默认关闭。
// - 网页版（PWA）：不发送任何通知（浏览器通知被刻意关闭）。
// - 打包 App 后（Capacitor）：使用本地通知，每天至多一条温和提醒。
// 业务代码只调用本模块，无需关心平台差异。

export const DAILY_NOTIFY_ID = 1;

export interface NotificationAdapter {
  isSupported(): boolean;
  requestPermission(): Promise<boolean>;
  scheduleDaily(id: number, title: string, body: string, hour: number, minute: number): Promise<void>;
  cancel(id: number): Promise<void>;
}

/** 网页版：不支持（不打扰） */
class NoopAdapter implements NotificationAdapter {
  isSupported(): boolean {
    return false;
  }

  async requestPermission(): Promise<boolean> {
    return false;
  }

  async scheduleDaily(): Promise<void> {
    /* 网页版不发送通知 */
  }

  async cancel(): Promise<void> {
    /* 无 */
  }
}

/** Capacitor 原生端：每天一条本地通知（不出网、无后端） */
class CapacitorAdapter implements NotificationAdapter {
  isSupported(): boolean {
    return true;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted';
    } catch {
      return false;
    }
  }

  async scheduleDaily(id: number, title: string, body: string, hour: number, minute: number): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      // 同一 id 的重复安排会覆盖旧提醒，避免堆积
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { on: { hour, minute }, allowWhileIdle: true },
          },
        ],
      });
    } catch {
      /* 静默失败：通知是锦上添花，不应打断使用 */
    }
  }

  async cancel(id: number): Promise<void> {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch {
      /* 忽略 */
    }
  }
}

function createAdapter(): NotificationAdapter {
  try {
    // 仅当运行在 Capacitor 原生容器中才启用原生通知
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    ) {
      return new CapacitorAdapter();
    }
  } catch {
    /* 降级为网页版空实现 */
  }
  return new NoopAdapter();
}

export const notifications: NotificationAdapter = createAdapter();
