import { useEffect, useState } from 'react';
import {
  dismissVersion,
  startAppUpdate,
  type UpdateInfo,
} from '../services/updateChecker';
import { APP_NAME, APP_VERSION } from '../context/AppContext';
import { useToast } from './QuoteToast';

interface UpdateDialogProps {
  info: UpdateInfo;
  onClose: () => void;
}

type UpdateState = 'idle' | 'downloading' | 'done' | 'error';

/** 更新弹窗：温和邀请，不强迫。可勾选「不再提醒这个版本」。 */
export function UpdateDialog({ info, onClose }: UpdateDialogProps) {
  const [dismissChecked, setDismissChecked] = useState(false);
  const [state, setState] = useState<UpdateState>('idle');
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleLater = () => {
    if (dismissChecked) dismissVersion(info.latest);
    onClose();
  };

  const handleUpdate = () => {
    if (dismissChecked) dismissVersion(info.latest);
    setState('downloading');
    setProgress(0);
    startAppUpdate(info.apkUrl, (pct) => setProgress(pct))
      .then((mode) => {
        if (mode === 'installing') {
          setState('done');
          toast('下载完成，正在打开安装');
        } else {
          // 网页回退：已在浏览器/系统下载器里开始
          setState('done');
          toast('已开始下载，完成后安装即可');
        }
        onClose();
      })
      .catch(() => {
        setState('error');
        toast('下载没成功，稍后再试试');
      });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-8">
      <div className="anim-fade absolute inset-0 bg-black/40" onClick={handleLater} aria-hidden />
      <div className="anim-pop relative w-full max-w-[340px] rounded-[28px] bg-card p-6 shadow-soft-lg">
        {/* 图标 */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-deep"
            aria-hidden
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </div>

        <h2 className="mt-4 text-center text-[19px] font-bold">发现新版本</h2>
        <p className="mt-1 text-center text-[13.5px] text-accent-deep">
          v{info.latest} · {APP_NAME}更新了
        </p>
        <p className="mt-1 text-center text-[12.5px] text-muted">想邀请你来慢慢看看</p>

        {/* 更新内容 */}
        <ul className="mt-4 space-y-3">
          {info.notes.length > 0 ? (
            info.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-snug">
                <span className="mt-0.5 flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-3">
                  <svg
                    width="11"
                    height="11"
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
                <span>{note}</span>
              </li>
            ))
          ) : (
            <li className="text-[13.5px] text-muted">这一版有一些小变化。</li>
          )}
        </ul>

        {/* 不再提醒（下载中隐藏，避免误点） */}
        {state === 'idle' && (
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-soft px-4 py-3.5">
            <input
              type="checkbox"
              checked={dismissChecked}
              onChange={(e) => setDismissChecked(e.target.checked)}
              className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-[6px] border-[2.5px] border-accent bg-card transition-colors checked:bg-accent"
              aria-label="不再提醒这个版本"
            />
            <span className="text-[13.5px] font-semibold">不再提醒这个版本</span>
            <span className="ml-auto shrink-0 text-[11px] leading-relaxed text-muted">
              更新内容后
              <br />
              也可以自己来设置里检查
            </span>
          </label>
        )}

        {/* 下载中：进度条 */}
        {state === 'downloading' && (
          <div className="mt-5">
            <div className="h-[10px] w-full overflow-hidden rounded-full bg-soft">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
            <p className="mt-2.5 text-center text-[12.5px] text-muted">
              正在下载更新包… {progress}%
            </p>
            <p className="mt-1 text-center text-[11.5px] text-muted">
              下载完成后会自动打开安装，稍等一下就好
            </p>
          </div>
        )}

        {/* 按钮 */}
        {state === 'idle' && (
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleLater}
              className="btn min-w-0 flex-1 !rounded-2xl !bg-soft text-[15px] font-semibold !text-muted"
            >
              以后再说
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              className="btn btn-primary min-w-0 flex-1 !rounded-2xl text-[15px] font-semibold"
            >
              去更新
            </button>
          </div>
        )}
        {state === 'error' && (
          <div className="mt-5">
            <button
              type="button"
              onClick={handleUpdate}
              className="btn btn-primary min-w-0 w-full !rounded-2xl text-[15px] font-semibold"
            >
              再试一次
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-[11.5px] text-muted">
          更新后，你的计划、日记、语录都会保留 · 当前 v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
