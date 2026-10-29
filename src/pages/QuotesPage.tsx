import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/QuoteToast';
import { Modal } from '../components/Modal';
import { QUOTE_SCENES, SCENE_LABELS } from '../data/quotes';
import type { Quote, QuoteScene } from '../types/models';

const MAX_TEXT = 120;

/** 语录集：管理所有随机语录（增 / 改 / 删），删掉的不会再回来 */
export function QuotesPage() {
  const { quotes, addQuote, updateQuote, deleteQuote } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [text, setText] = useState('');
  const [scene, setScene] = useState<QuoteScene>('open');

  const openAdd = () => {
    setEditing(null);
    setText('');
    setScene('open');
    setEditorOpen(true);
  };

  const openEdit = (q: Quote) => {
    setEditing(q);
    setText(q.text);
    setScene(q.scene);
    setEditorOpen(true);
  };

  const handleSave = () => {
    const t = text.trim();
    if (!t) {
      toast('先写下这句话，再保存吧。');
      return;
    }
    if (editing) {
      updateQuote(editing.id, scene, t);
      toast('改好了。');
    } else {
      addQuote(scene, t);
      toast('收进语录集了。');
    }
    setEditorOpen(false);
  };

  const handleDelete = (q: Quote) => {
    deleteQuote(q.id);
    toast('删掉了，不会再出现啦。');
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pt-[calc(20px+env(safe-area-inset-top))]">
      {/* 顶栏 */}
      <div className="anim-rise flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 items-center rounded-full bg-soft px-4 text-[14.5px] font-semibold text-accent-deep transition-transform active:scale-95"
          aria-label="返回"
        >
          ‹ 返回
        </button>
        <h1 className="text-[22px] font-bold">语录集</h1>
        <span className="w-[76px] text-right text-[13px] text-muted">共 {quotes.length} 句</span>
      </div>

      <div className="anim-rise mt-3 flex items-center justify-between">
        <p className="text-[13px] text-muted">这些句子会随机出现在今日页。</p>
        <button
          type="button"
          onClick={openAdd}
          className="flex h-10 items-center gap-1 rounded-full bg-accent px-4 text-[14px] font-semibold text-white shadow-soft transition-transform active:scale-95"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          添加一句
        </button>
      </div>

      {QUOTE_SCENES.map((sc) => {
        const list = quotes.filter((q) => q.scene === sc);
        return (
          <section key={sc} className="anim-rise mt-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[15px] font-bold text-accent-deep">{SCENE_LABELS[sc]}</h2>
              <span className="text-[12px] text-muted">{list.length} 句</span>
            </div>
            {list.length === 0 ? (
              <div className="card mt-2.5 p-4">
                <p className="text-[13px] leading-relaxed text-muted">
                  这一栏还没有句子，点右上角「添加一句」写下它。
                </p>
              </div>
            ) : (
              <div className="mt-2.5 space-y-2.5">
                {list.map((q) => (
                  <div key={q.id} className="card flex items-center gap-3 p-4">
                    <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed text-ink/90 line-clamp-2">
                      {q.text}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(q)}
                        className="flex h-8 w-10 items-center justify-center rounded-full bg-soft text-[13px] font-semibold text-accent-deep transition-transform active:scale-90"
                        aria-label="改这句"
                      >
                        改
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q)}
                        className="flex h-8 w-10 items-center justify-center rounded-full bg-soft text-[13px] font-semibold text-muted transition-transform active:scale-90"
                        aria-label="删这句"
                      >
                        删
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <p className="mt-8 pb-[calc(32px+env(safe-area-inset-bottom))] text-center text-[12px] text-muted">
        删掉的句子不会再出现，想恢复可以重新添加。
      </p>

      <Modal
        open={editorOpen}
        title={editing ? '改一句语录' : '添加一句语录'}
        onClose={() => setEditorOpen(false)}
      >
        <label className="block">
          <span className="text-[12.5px] font-semibold text-muted">这句话</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            placeholder="写下想对自己说的那句话…"
            className="field mt-1.5 min-h-[96px]"
            maxLength={MAX_TEXT}
          />
          <span className="mt-1 block text-right text-[11.5px] text-muted">
            {text.length} / {MAX_TEXT}
          </span>
        </label>

        <div className="mt-4">
          <p className="text-[12.5px] font-semibold text-muted">它属于哪个场景</p>
          <p className="mt-0.5 text-[12px] text-muted">选好后，这句话会在对应时机随机出现</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {QUOTE_SCENES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScene(s)}
                className={
                  scene === s
                    ? 'rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-transform active:scale-95'
                    : 'rounded-full bg-soft px-4 py-2 text-[13px] font-medium text-muted transition-transform active:scale-95'
                }
              >
                {SCENE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" className="btn btn-ghost flex-1" onClick={() => setEditorOpen(false)}>
            取消
          </button>
          <button type="button" className="btn btn-primary flex-1" onClick={handleSave}>
            保存
          </button>
        </div>
      </Modal>
    </main>
  );
}
