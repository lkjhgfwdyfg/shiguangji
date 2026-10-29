import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 预留配置。
 * 当前 MVP 以 PWA（手机浏览器 + 添加到主屏幕）为目标。
 * 未来打包 iOS / Android App 时执行：
 *   npx cap add android / npx cap add ios
 *   npm run build && npx cap sync
 *   npx cap open android / npx cap open ios
 * 核心业务代码无需重写。
 */
const config: CapacitorConfig = {
  appId: 'com.youplan.app',
  appName: '拾光记',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
