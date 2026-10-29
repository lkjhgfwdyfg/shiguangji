import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/QuoteToast';
import { BottomNav } from './components/BottomNav';
import { UpdateDialog } from './components/UpdateDialog';
import { TodayPage } from './pages/TodayPage';
import { PlansPage } from './pages/PlansPage';
import { RecordPage } from './pages/RecordPage';
import { ReviewPage } from './pages/ReviewPage';
import { SettingsPage } from './pages/SettingsPage';
import { QuotesPage } from './pages/QuotesPage';
import {
  fetchUpdateManifest,
  hasAutoCheckedToday,
  isNewerVersion,
  isVersionDismissed,
  markAutoCheckedToday,
  type UpdateInfo,
} from './services/updateChecker';
import { APP_VERSION } from './utils/exportImport';

/** 根据设置应用主题色与深浅模式（CSS 变量） */
function ThemeApplier() {
  const { settings } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', settings.accent);

    const apply = () => {
      if (settings.themeMode === 'system') {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', settings.themeMode);
      }
    };
    apply();

    if (settings.themeMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [settings.accent, settings.themeMode]);

  return null;
}

export default function App() {
  // 启动自动检查更新：每天至多一次，失败静默，已勾选「不再提醒」的版本跳过
  const [pendingUpdate, setPendingUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (hasAutoCheckedToday()) return;
      markAutoCheckedToday();
      const info = await fetchUpdateManifest();
      if (cancelled || !info) return;
      if (isNewerVersion(info.latest, APP_VERSION) && !isVersionDismissed(info.latest)) {
        setPendingUpdate(info);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppProvider>
      <ToastProvider>
        <ThemeApplier />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/record" element={<RecordPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
          <BottomNav />
        </HashRouter>
        {pendingUpdate && (
          <UpdateDialog info={pendingUpdate} onClose={() => setPendingUpdate(null)} />
        )}
      </ToastProvider>
    </AppProvider>
  );
}
