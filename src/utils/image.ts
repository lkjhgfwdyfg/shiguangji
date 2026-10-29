// ============ 图片工具：压缩 + 粘贴提取 ============
// 手机照片通常 3-10MB，直接存会很快占满本地空间。
// 这里统一压缩到最长边 maxDim、JPEG 质量 quality，保证"够看且不占地方"。

export interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const MAX_DIM = 1280;
const QUALITY = 0.78;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片读取失败'));
    img.src = src;
  });
}

/** 把图片文件压缩成 data URL（JPEG） */
export async function fileToCompressedImage(file: File): Promise<CompressedImage> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
  return compressDataUrl(raw);
}

/** 把 data URL 压缩（等比例缩放 + JPEG） */
export async function compressDataUrl(
  dataUrl: string,
  maxDim = MAX_DIM,
  quality = QUALITY,
): Promise<CompressedImage> {
  const img = await loadImage(dataUrl);
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl, width, height };
  ctx.drawImage(img, 0, 0, width, height);
  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    width,
    height,
  };
}

/** 从粘贴事件中提取图片文件（支持 Ctrl+V / 长按粘贴） */
export function extractImageFromClipboard(e: ClipboardEvent): File | null {
  const items = e.clipboardData?.items;
  if (!items) return null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
