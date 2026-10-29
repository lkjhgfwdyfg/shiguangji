import { useEffect, useRef, useState } from 'react';
import type { CollectionEntry } from '../types/models';
import { useApp } from '../context/AppContext';
import { useToast } from './QuoteToast';
import { ConfirmDialog } from './ConfirmDialog';
import { CloseIcon, TrashIcon, ChevronDownIcon } from './icons';
import { formatDateCN, weekdayCN, formatTimeHM } from '../utils/date';
import { imageStore } from '../storage/IndexedDBImageStore';
import { uid } from '../utils/id';
import { fileToCompressedImage, extractImageFromClipboard } from '../utils/image';

interface CollectionDetailProps {
  collection: CollectionEntry;
  onBack: () => void;
}

/** 完成收录详情：大图查看 + 文字可编辑（自动保存）+ 继续添加 / 移除图片 */
export function CollectionDetail({ collection, onBack }: CollectionDetailProps) {
  const { updateCollection, deleteCollection } = useApp();
  const toast = useToast();

  const [text, setText] = useState(collection.note);
  const [images, setImages] = useState<{ id: string; dataUrl: string }[]>([]);
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    void imageStore.getMany(collection.imageIds).then((map) => {
      if (!alive) return;
      const list = collection.imageIds
        .filter((id) => map[id])
        .map((id) => ({ id, dataUrl: map[id] }));
      setImages(list);
      setSelected(0);
    });
    return () => {
      alive = false;
    };
  }, [collection.imageIds]);

  const persist = (next: { note: string; imageIds: string[] }) => {
    updateCollection(collection.id, next);
    setSavedAt(formatTimeHM(new Date().toISOString()));
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSavedAt(null), 1600);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      persist({ note: value, imageIds: collection.imageIds });
    }, 700);
  };

  const handleTextBlur = () => {
    window.clearTimeout(saveTimer.current);
    if (text !== collection.note) persist({ note: text, imageIds: collection.imageIds });
  };

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    for (const file of list) {
      try {
        const c = await fileToCompressedImage(file);
        const id = await imageStore.put(uid(), c.dataUrl);
        const nextIds = [...collection.imageIds, id];
        persist({ note: text, imageIds: nextIds });
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
    const nextIds = collection.imageIds.filter((i) => i !== id);
    persist({ note: text, imageIds: nextIds });
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDelete = () => {
    deleteCollection(collection.id);
    setConfirmDelete(false);
    toast('这条记录已经轻轻放下了。');
    onBack();
  };

  const bigImage = images[Math.min(selected, Math.max(0, images.length - 1))];
  const kindLabel = collection.kind === 'archived' ? '归档' : '完成';

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
        <div className="min-w-0 px-2 text-center">
          <p className="truncate text-[15px] font-bold">{collection.planTitle}</p>
          <p className="mt-0.5 text-[11.5px] text-muted">
            {weekdayCN(collection.date)} · {savedAt ? `已保存 ${savedAt}` : '编辑后自动保存'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="btn btn-ghost !min-h-[40px] !px-2 text-danger"
          aria-label="删除这条记录"
        >
          <TrashIcon size={17} />
        </button>
      </div>

      {/* 完成日期 */}
      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-full bg-accent-soft px-3 py-1.5 text-[12.5px] font-semibold text-accent-deep">
          {formatDateCN(collection.date)} · {kindLabel}
        </span>
      </div>

      {/* 大图 */}
      {bigImage ? (
        <button
          type="button"
          className="mt-4 block w-full overflow-hidden rounded-card shadow-soft"
          onClick={() => setLightbox(true)}
          aria-label="查看大图"
        >
          <img src={bigImage.dataUrl} alt="记录配图大图" className="max-h-[300px] w-full object-cover" />
        </button>
      ) : (
        <div className="mt-4 flex h-40 items-center justify-center rounded-card bg-soft text-[13px] text-muted">
          这件事还没有配图，点下方加一张吧。
        </div>
      )}

      {/* 文字记录 */}
      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value.slice(0, 2000))}
        onBlur={handleTextBlur}
        onPaste={handlePaste}
        placeholder="写写这件事吧…想说什么都可以。"
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
        title="删除这段记录？"
        message="只会删掉这段记录和照片，不影响“这件事完成过”这个事实。"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
