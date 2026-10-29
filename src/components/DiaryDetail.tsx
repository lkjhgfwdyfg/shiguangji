import { useEffect, useRef, useState } from 'react';
import type { DiaryEntry } from '../types/models';
import { useApp } from '../context/AppContext';
import { useToast } from './QuoteToast';
import { ConfirmDialog } from './ConfirmDialog';
import { CloseIcon, TrashIcon, ChevronDownIcon } from './icons';
import { formatDateCN, weekdayCN, formatTimeHM } from '../utils/date';
import { imageStore } from '../storage/IndexedDBImageStore';
import { uid } from '../utils/id';
import { fileToCompressedImage, extractImageFromClipboard } from '../utils/image';

interface DiaryDetailProps {
  entry: DiaryEntry;
  onBack: () => void;
}

/** 日记详情：大图查看 + 文字可编辑（自动保存）+ 继续添加 / 移除图片 */
export function DiaryDetail({ entry, onBack }: DiaryDetailProps) {
  const { updateDiary, deleteDiary } = useApp();
  const toast = useToast();

  const [text, setText] = useState(entry.text);
  const [images, setImages] = useState<{ id: string; dataUrl: string }[]>([]);
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  // 读取图片本体
  useEffect(() => {
    let alive = true;
    void imageStore.getMany(entry.imageIds).then((map) => {
      if (!alive) return;
      const list = entry.imageIds
        .filter((id) => map[id])
        .map((id) => ({ id, dataUrl: map[id] }));
      setImages(list);
      setSelected(0);
    });
    return () => {
      alive = false;
    };
  }, [entry.imageIds]);

  const persist = (next: DiaryEntry) => {
    updateDiary({ ...next, updatedAt: new Date().toISOString() });
    setSavedAt(formatTimeHM(new Date().toISOString()));
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSavedAt(null), 1600);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    // 编辑后自动保存（防抖）
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      persist({ ...entry, text: value });
    }, 700);
  };

  const handleTextBlur = () => {
    window.clearTimeout(saveTimer.current);
    if (text !== entry.text) persist({ ...entry, text });
  };

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    for (const file of list) {
      try {
        const c = await fileToCompressedImage(file);
        const id = await imageStore.put(uid(), c.dataUrl);
        const nextIds = [...entry.imageIds, id];
        persist({ ...entry, imageIds: nextIds });
        setImages((prev) => [...prev, { id, dataUrl: c.dataUrl }]);
        setSelected(nextIds.length - 1);
      } catch {
        /* 跳过失败图片 */
      }
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) void addFiles(files);
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = extractImageFromClipboard(e.nativeEvent);
    if (!file) return;
    e.preventDefault();
    void addFiles([file]);
  };

  const removeImage = (id: string) => {
    void imageStore.delete(id).catch(() => undefined);
    const nextIds = entry.imageIds.filter((i) => i !== id);
    persist({ ...entry, imageIds: nextIds });
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDelete = () => {
    deleteDiary(entry.id);
    setConfirmDelete(false);
    toast('这篇日记已经轻轻放下了。');
    onBack();
  };

  const bigImage = images[Math.min(selected, Math.max(0, images.length - 1))];

  return (
    <div className="anim-fade">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost !min-h-[40px] !px-2 text-[14px]"
        >
          <ChevronDownIcon size={18} className="rotate-90" /> 返回
        </button>
        <div className="text-center">
          <p className="text-[15px] font-bold">{formatDateCN(entry.date)}</p>
          <p className="mt-0.5 text-[11.5px] text-muted">
            {weekdayCN(entry.date)} · {savedAt ? `已保存 ${savedAt}` : '编辑后自动保存'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="btn btn-ghost !min-h-[40px] !px-2 text-danger"
          aria-label="删除这篇日记"
        >
          <TrashIcon size={17} />
        </button>
      </div>

      {/* 大图 */}
      {bigImage ? (
        <button
          type="button"
          className="mt-4 block w-full overflow-hidden rounded-card shadow-soft"
          onClick={() => setLightbox(true)}
          aria-label="查看大图"
        >
          <img src={bigImage.dataUrl} alt="日记配图大图" className="max-h-[300px] w-full object-cover" />
        </button>
      ) : (
        <div className="mt-4 flex h-40 items-center justify-center rounded-card bg-soft text-[13px] text-muted">
          这篇日记还没有配图，点下方加一张吧。
        </div>
      )}

      {/* 文字编辑 */}
      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value.slice(0, 2000))}
        onBlur={handleTextBlur}
        onPaste={handlePaste}
        placeholder="今天想写点什么…"
        className="field mt-4 min-h-[150px] leading-relaxed"
        maxLength={2000}
      />

      {/* 缩略图行 */}
      {images.length > 0 && (
        <p className="mt-4 text-[12.5px] font-semibold text-muted">共 {images.length} 张图片</p>
      )}
      <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
        {images.map((img, idx) => (
          <div key={img.id} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSelected(idx)}
              className={`thumb-tile block h-20 w-20 ${idx === selected ? 'ring-2 ring-accent' : ''}`}
              aria-label={`第 ${idx + 1} 张图`}
            >
              <img src={img.dataUrl} alt="" />
            </button>
            <button
              type="button"
              className="thumb-remove"
              onClick={() => removeImage(img.id)}
              aria-label="移除这张图"
            >
              <CloseIcon size={11} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="add-img-tile h-20 w-20 shrink-0"
          onClick={() => fileRef.current?.click()}
          aria-label="添加图片"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="text-[10.5px]">加一张</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* 大图灯箱 */}
      {lightbox && bigImage && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button
            type="button"
            className="absolute right-5 top-[calc(20px+env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            onClick={() => setLightbox(false)}
            aria-label="关闭大图"
          >
            <CloseIcon size={20} />
          </button>
          <img src={bigImage.dataUrl} alt="放大查看" />
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="删除这篇日记？"
        message="日记和图片都会被删除，无法恢复。放心，它已经好好陪过你了。"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
