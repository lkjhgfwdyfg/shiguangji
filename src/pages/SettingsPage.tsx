import { useRef, useState } from 'react';
import { useApp, APP_NAME, APP_VERSION } from '../context/AppContext';
import { useToast } from '../components/QuoteToast';
import { Switch } from '../components/Switch';
import { Segmented } from '../components/Segmented';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { UpdateDialog } from '../components/UpdateDialog';
import { BellIcon, MoonIcon } from '../components/icons';
import { exportBackup, type ExportOutcome } from '../services/exportService';
import { countWrittenWords, formatCount } from '../utils/wordCount';
import {
  fetchUpdateManifest,
  isNewerVersion,
  type UpdateInfo,
} from '../services/updateChecker';
import type { ThemeAccent, ThemeMode } from '../types/models';

const ACCENTS: { value: ThemeAccent; label: string; color: string }[] = [
  { value: 'apricot', label: '浅杏', color: '#e9a87c' },
  { value: 'sunny', label: '暖黄', color: '#e9b949' },
  { value: 'sage', label: '柔绿', color: '#8faf7f' },
];

export function SettingsPage() {
  const { settings, updateSettings, exportJSON, importJSON, clearAll } = useApp();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [writtenWords] = useState(() => countWrittenWords());
  const [exportResult, setExportResult] = useState<ExportOutcome | null>(null);

  const handleExport = async () => {
    const outcome = await exportBackup(exportJSON());
    if (outcome.ok) {
      setExportResult(outcome);
    } else {
      toast(outcome.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImport(String(reader.result ?? ''));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (pendingImport == null) return;
    const res = importJSON(pendingImport);
    toast(res.ok ? res.message : res.message);
    setPendingImport(null);
  };

  const handleConfirmClear = () => {
    clearAll();
    setConfirmClear(false);
    toast('已清空，可以重新开始。');
  };

  // 检查更新状态
  const [checkState, setCheckState] = useState<'idle' | 'checking' | 'latest' | 'failed'>('idle');
  const [manualUpdate, setManualUpdate] = useState<UpdateInfo | null>(null);

  const handleCheckUpdate = async () => {
    if (checkState === 'checking') return;
    setCheckState('checking');
    const info = await fetchUpdateManifest();
    if (!info) {
      setCheckState('failed');
      return;
    }
    if (isNewerVersion(info.latest, APP_VERSION)) {
      setCheckState('idle');
      setManualUpdate(info);
    } else {
      setCheckState('latest');
    }
  };

  return (
    <main className="page-pad-bottom mx-auto max-w-md px-5 pt-[calc(20px+env(safe-area-inset-top))]">
      <header className="anim-rise">
        <h1 className="text-[22px] font-bold">设置</h1>
        <p className="mt-1 text-[13.5px] text-muted">按你喜欢的方式，照顾自己。</p>
      </header>

      {/* 通知 */}
      <section className="anim-rise card mt-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
              <BellIcon size={18} />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold">提醒通知</p>
              <p className="mt-0.5 text-[12px] text-muted">温和的本地提醒，不催收</p>
            </div>
          </div>
          <Switch
            checked={settings.notifyEnabled}
            onChange={(v) => updateSettings({ notifyEnabled: v })}
            label="提醒通知"
          />
        </div>

        {settings.notifyEnabled && (
          <div className="anim-rise mt-4 rounded-2xl bg-soft p-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] font-semibold">每天轻轻提醒一次</span>
              <input
                type="time"
                value={settings.notifyTime}
                onChange={(e) => updateSettings({ notifyTime: e.target.value })}
                className="rounded-xl border border-line bg-card px-3 py-2 text-[14px] text-ink outline-none focus:border-accent"
              />
            </label>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              到点后只提醒一句温柔的话，不会催你做事。
            </p>
          </div>
        )}

        <p className="mt-3 text-[12px] leading-relaxed text-muted">
          只在 App 内生效（网页版不发送通知）。每天至多一条，不联网、不打扰。
        </p>
      </section>

      {/* 每日一句 */}
      <section className="anim-rise card mt-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[14.5px] font-semibold">每日一句</p>
            <p className="mt-0.5 text-[12px] text-muted">今日页的语录可点击换一句，点书签进入语录集</p>
          </div>
          <Switch
            checked={settings.dailyQuote}
            onChange={(v) => updateSettings({ dailyQuote: v })}
            label="每日一句"
          />
        </div>
      </section>

      {/* 主题色 */}
      <section className="anim-rise card mt-4 p-5">
        <p className="text-[14.5px] font-semibold">主题色</p>
        <div className="mt-3 flex gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => updateSettings({ accent: a.value })}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-soft py-3.5 transition-transform active:scale-95"
            >
              <span
                className={[
                  'h-8 w-8 rounded-full border-4 transition-all',
                  settings.accent === a.value ? 'border-card shadow-soft' : 'border-transparent',
                ].join(' ')}
                style={{ backgroundColor: a.color }}
              />
              <span
                className={[
                  'text-[12.5px] font-medium',
                  settings.accent === a.value ? 'text-accent-deep' : 'text-muted',
                ].join(' ')}
              >
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 深色模式 */}
      <section className="anim-rise card mt-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
            <MoonIcon size={18} />
          </span>
          <div>
            <p className="text-[14.5px] font-semibold">外观</p>
            <p className="mt-0.5 text-[12px] text-muted">默认温馨浅色，也可以换成深色</p>
          </div>
        </div>
        <div className="mt-4">
          <Segmented
            value={settings.themeMode}
            options={[
              { value: 'light', label: '浅色' },
              { value: 'dark', label: '深色' },
              { value: 'system', label: '跟随系统' },
            ]}
            onChange={(v: ThemeMode) => updateSettings({ themeMode: v })}
          />
        </div>
      </section>

      {/* 检查更新 */}
      <section className="anim-rise card mt-4 p-5">
        <button
          type="button"
          onClick={handleCheckUpdate}
          disabled={checkState === 'checking'}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </span>
          <span className="flex-1">
            <span className="block text-[14.5px] font-semibold">检查更新</span>
            <span className="mt-0.5 block text-[12px] text-muted">
              {checkState === 'checking'
                ? '正在看看有没有新版本…'
                : '有新版本时打开 App 会轻轻提醒你'}
            </span>
          </span>
          <span className="rounded-full bg-soft px-3 py-1 text-[12.5px] font-semibold text-muted">
            v{APP_VERSION}
          </span>
        </button>

        {checkState === 'latest' && (
          <div className="anim-rise mt-4 flex items-center gap-2.5 rounded-2xl bg-accent-soft px-4 py-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-3">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-ink"
                aria-hidden
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span className="text-[13.5px] font-semibold">已经是最新版本了，安心用吧。</span>
          </div>
        )}

        {checkState === 'failed' && (
          <p className="anim-rise mt-4 rounded-2xl bg-soft px-4 py-3 text-[13px] text-muted">
            暂时没连上网，晚点再试试就好。
          </p>
        )}
      </section>

      {/* 数据 */}
      <section className="anim-rise card mt-4 p-5">
        <p className="text-[14.5px] font-semibold">数据</p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          所有数据只保存在本机（离线优先），不上传任何服务器。
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" className="btn btn-soft text-[13px]" onClick={handleExport}>
            导出 JSON
          </button>
          <button
            type="button"
            className="btn btn-soft text-[13px]"
            onClick={() => fileRef.current?.click()}
          >
            导入 JSON
          </button>
          <button
            type="button"
            className="btn btn-danger text-[13px]"
            onClick={() => setConfirmClear(true)}
          >
            清空数据
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </section>

      {/* 关于 */}
      <section className="anim-rise card mt-4 p-5 text-center">
        <p className="text-[15px] font-bold">{APP_NAME}</p>
        <p className="mt-1 text-[12.5px] text-muted">版本 {APP_VERSION}</p>
        <div className="mx-auto mt-4 inline-block rounded-full bg-accent-soft px-5 py-2.5">
          <p className="text-[13.5px] font-bold text-accent-deep">
            你在这里写下了 {formatCount(writtenWords)} 个字
          </p>
        </div>
        <p className="mx-auto mt-3 max-w-[260px] text-[13px] leading-relaxed text-muted">
          日记、灵感、记录，慢慢积累的句子。
        </p>
      </section>

      <ConfirmDialog
        open={pendingImport != null}
        title="导入这份备份？"
        message="导入会用备份内容替换当前数据，当前数据会先被覆盖。建议先导出备份。"
        confirmText="导入"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />

      <ConfirmDialog
        open={confirmClear}
        title="清空所有数据？"
        message="所有计划和记录都会被清空，且无法恢复。想清楚的话，随时可以从头开始。"
        confirmText="清空"
        onConfirm={handleConfirmClear}
        onCancel={() => setConfirmClear(false)}
      />

      {manualUpdate && (
        <UpdateDialog info={manualUpdate} onClose={() => setManualUpdate(null)} />
      )}

      <Modal
        open={exportResult != null}
        title="导出备份"
        onClose={() => setExportResult(null)}
      >
        {exportResult && (
          <div className="pb-2 pt-1 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <p className="mt-3 text-[15px] font-bold">{exportResult.message}</p>
            <div className="mt-4 rounded-2xl bg-soft px-4 py-3 text-left">
              <p className="text-[11.5px] font-semibold text-muted">文件名</p>
              <p className="mt-0.5 break-all text-[13px] font-medium">{exportResult.filename}</p>
              <p className="mt-2.5 text-[11.5px] font-semibold text-muted">保存位置</p>
              <p className="mt-0.5 break-all text-[13px] font-medium">{exportResult.location}</p>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
              备份包含你的全部计划、记录与语录，换设备时在「导入 JSON」里恢复。
            </p>
            <button
              type="button"
              className="btn btn-primary mt-5 w-full"
              onClick={() => setExportResult(null)}
            >
              知道了
            </button>
          </div>
        )}
      </Modal>
    </main>
  );
}
