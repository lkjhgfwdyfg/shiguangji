import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/QuoteToast';
import { Segmented } from '../components/Segmented';
import { DiaryEditor } from '../components/DiaryEditor';
import { DiaryDetail } from '../components/DiaryDetail';
import { CloseIcon } from '../components/icons';
import { formatDateCN, formatTimeHM } from '../utils/date';
import { imageStore } from '../storage/IndexedDBImageStore';

type Tab = 'diary' | 'inspiration';

/** 列表里的第一张图缩略图 */
function FirstThumb({ imageIds }: { imageIds: string[] }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const first = imageIds[0];
  useEffect(() => {
    if (!first) {
      setDataUrl(null);
      return;
    }
    let alive = true;
    void imageStore.get(first).then((url) => {
      if (alive) setDataUrl(url);
    });
    return () => {
      alive = false;
    };
  }, [first]);
  if (!dataUrl) return null;
  return (
    <div className="thumb-tile h-[68px] w-[68px] shrink-0 self-start">
      <img src={dataUrl} alt="" />
    </div>
  );
}

export function RecordPage() {
  const {
    diaryEntries,
    inspirations,
    addDiary,
    addInspiration,
    deleteInspiration,
  } = useApp();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>('diary');
  const [editorOpen, setEditorOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [inspirationInput, setInspirationInput] = useState('');

  const viewing = diaryEntries.find((e) => e.id === viewingId) ?? null;

  const sorted = [...diaryEntries].sort((a, b) =>
    a.date === b.date ? (a.createdAt < b.createdAt ? 1 : -1) : a.date < b.date ? 1 : -1,
  );

  const handleSaved = (input: { date: string; text: string; imageIds: string[] }) => {
    addDiary(input);
    setEditorOpen(false);
    toast(input.text ? '这篇日记收好了。' : '记下了一小段。');
  };

  const handleAddInspiration = () => {
    const t = inspirationInput.trim();
    if (!t) return;
    addInspiration(t);
    setInspirationInput('');
    toast('记下了这个想法。');
  };

  if (viewing) {
    return (
      <main className="page-pad-bottom mx-auto max-w-md px-5 pt-[calc(20px+env(safe-area-inset-top))]">
        <DiaryDetail entry={viewing} onBack={() => setViewingId(null)} />
      </main>
    );
  }

  return (
    <main className="page-pad-bottom mx-auto max-w-md px-5 pt-[calc(20px+env(safe-area-inset-top))]">
      <header className="anim-rise">
        <h1 className="text-[22px] font-bold">记录</h1>
        <p className="mt-1 text-[13.5px] text-muted">写下来，就是温柔的整理。</p>
      </header>

      <div className="anim-rise mt-5">
        <Segmented
          value={tab}
          options={[
            { value: 'diary', label: '日记' },
            { value: 'inspiration', label: '灵感' },
          ]}
          onChange={setTab}
        />
      </div>

      {tab === 'diary' && (
        <>
          <div className="anim-rise mt-4 flex justify-center">
            <span className="rounded-full bg-soft px-5 py-2 text-[13px] font-semibold text-accent-deep">
              已收录 · {diaryEntries.length} 篇
            </span>
          </div>

          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="anim-rise mt-4 flex w-full items-center gap-3 rounded-card border-[1.5px] border-dashed border-line bg-soft px-5 py-4 text-[14.5px] font-semibold text-muted transition-colors active:border-accent"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            写今天的一小段
          </button>

          <section className="mt-4 space-y-4">
            {sorted.length === 0 ? (
              <div className="anim-rise card flex flex-col items-center px-8 py-12 text-center">
                <p className="text-[15px] font-semibold">还没有日记</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  从今天开始，随手记下一点点就好。可以只有一句话，也可以贴张照片。
                </p>
              </div>
            ) : (
              sorted.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setViewingId(entry.id)}
                  className="anim-rise card block w-full text-left transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[14.5px] font-bold">{formatDateCN(entry.date)}</p>
                    <span className="text-[12px] text-muted">{formatTimeHM(entry.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      {entry.text ? (
                        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-ink/90">
                          {entry.text}
                        </p>
                      ) : (
                        <p className="text-[13px] text-muted">
                          {entry.imageIds.length > 0
                            ? `${entry.imageIds.length} 张照片，一段安静的记录。`
                            : '这一天，轻轻留了个白。'}
                        </p>
                      )}
                      {entry.imageIds.length > 1 && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] text-muted">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                            <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
                            <circle cx="9" cy="10" r="1.6" />
                            <path d="M4 17.5l4.5-4.5 3 3 4-4L20 17" />
                          </svg>
                          {entry.imageIds.length} 张
                        </span>
                      )}
                    </div>
                    <FirstThumb imageIds={entry.imageIds} />
                  </div>
                </button>
              ))
            )}
          </section>
        </>
      )}

      {tab === 'inspiration' && (
        <>
          {/* 随手记 */}
          <section className="anim-rise mt-4">
            <p className="text-[13px] font-bold">随手记</p>
            <div className="card mt-2 p-4">
              <textarea
                value={inspirationInput}
                onChange={(e) => setInspirationInput(e.target.value.slice(0, 300))}
                placeholder="忽然想到的一句话、一个点子…"
                className="field min-h-[84px]"
                maxLength={300}
              />
              <button
                type="button"
                className="btn btn-soft mt-3 w-full"
                onClick={handleAddInspiration}
              >
                记下来
              </button>
            </div>

            {inspirations.length > 0 && (
              <div className="mt-2 space-y-2">
                {inspirations.map((item) => (
                  <div key={item.id} className="card flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] leading-relaxed">{item.text}</p>
                      <p className="mt-1.5 text-[11.5px] text-muted">{formatDateCN(item.createdAt.slice(0, 10))}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        deleteInspiration(item.id);
                        toast('已经放下了。');
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-muted transition-transform active:scale-90"
                      aria-label="删除这条灵感"
                    >
                      <CloseIcon size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <DiaryEditor
        open={editorOpen}
        initial={null}
        onClose={() => setEditorOpen(false)}
        onSaved={handleSaved}
      />
    </main>
  );
}
