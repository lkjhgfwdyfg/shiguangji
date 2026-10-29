import { useEffect, useRef, useState } from 'react';
import type { DiaryEntry } from '../types/models';
import { Modal } from './Modal';
import { CloseIcon } from './icons';
import { uid } from '../utils/id';
import { todayISO } from '../utils/date';
import { imageStore } from '../storage/IndexedDBImageStore';
import { fileToCompressedImage, extractImageFromClipboard } from '../utils/image';

interface LocalImage {
  key: string;
  id?: string; // 已入库的图片有 id；新选的在保存时才入库
  dataUrl: string;
}

interface DiaryEditorProps {
  open: boolean;
  initial?: DiaryEntry | null;
  onClose: () => void;
  onSaved: (input: { date: string; text: string; imageIds: string[] }) => void;
}

const MAX_TEXT = 500;

/** 写日记弹层：文字 + 多张图片（相册/拍照/粘贴），保存时统一压缩入库 */
export function DiaryEditor({ open, initial, onClose, onSaved }: DiaryEditorProps) {
  const [date, setDate] = useState(todayISO());
  const [text, setText] = useState('');
  const [images, setImages] = useState<LocalImage[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDate(initial?.date ?? todayISO());
    setText(initial?.text ?? '');
    setImages(
      initial?.imageIds.map((id) => ({ key: id, id, dataUrl: '' })) ?? [],
    );
    setPendingDelete([]);
    setSaving(false);
  }, [open, initial]);

  // 有 id 的图片异步读取本体（编辑场景）
  useEffect(() => {
    if (!open) return;
    const withId = images.filter((i) => i.id && !i.dataUrl);
    if (withId.length === 0) return;
    let alive = true;
    void imageStore.getMany(withId.map((i) => i.id as string)).then((map) => {
      if (!alive) return;
      setImages((prev) =>
        prev.map((i) => (i.id && map[i.id] ? { ...i, dataUrl: map[i.id] } : i)),
      );
    });
    return () => {
      alive = false;
    };
  }, [open]);

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    const next: LocalImage[] = [];
    for (const file of list) {
      try {
        const c = await fileToCompressedImage(file);
        next.push({ key: uid(), dataUrl: c.dataUrl });
      } catch {
        /* 单张失败跳过 */
      }
    }
    if (next.length) setImages((prev) => [...prev, ...next]);
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

  const removeImage = (key: string) => {
    const target = images.find((i) => i.key === key);
    if (target?.id) setPendingDelete((prev) => [...prev, target.id as string]);
    setImages((prev) => prev.filter((i) => i.key !== key));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const ids: string[] = [];
    try {
      for (const img of images) {
        if (img.id) {
          ids.push(img.id);
        } else if (img.dataUrl) {
          ids.push(await imageStore.put(uid(), img.dataUrl));
        }
      }
      for (const id of pendingDelete) {
        void imageStore.delete(id).catch(() => undefined);
      }
      onSaved({ date, text: text.trim(), imageIds: ids });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={initial ? '编辑日记' : '写日记'} onClose={onClose}>
      <div onPaste={handlePaste}>
        <label className="block">
          <span className="text-[12.5px] font-semibold text-muted">日期</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field mt-1.5"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-[12.5px] font-semibold text-muted">今天想写点什么…</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            placeholder="写下来，就是温柔的整理。"
            className="field mt-1.5 min-h-[140px]"
            maxLength={MAX_TEXT}
          />
          <span className="mt-1 block text-right text-[11.5px] text-muted">
            {text.length} / {MAX_TEXT}
          </span>
        </label>

        <div className="mt-2">
          <p className="text-[12.5px] font-semibold text-muted">图片（可多张）</p>
          {images.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {images.map((img) => (
                <div key={img.key} className="thumb-tile aspect-square">
                  {img.dataUrl ? (
                    <img src={img.dataUrl} alt="日记配图" />
                  ) : (
                    <div className="h-full w-full bg-soft" />
                  )}
                  <button
                    type="button"
                    className="thumb-remove"
                    onClick={() => removeImage(img.key)}
                    aria-label="移除这张图"
                  >
                    <CloseIcon size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className="add-img-tile mt-2 h-20 w-full"
            onClick={() => fileRef.current?.click()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
              <circle cx="9" cy="10" r="1.6" />
              <path d="M4 17.5l4.5-4.5 3 3 4-4L20 17" />
            </svg>
            添加图片（相册 / 拍照 / 粘贴）
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

        <div className="mt-5 flex gap-3">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={saving}>
            先不写
          </button>
          <button
            type="button"
            className="btn btn-primary flex-1"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? '正在保存…' : '保存这篇日记'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
