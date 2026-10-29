// ============ 备份导出适配器 ============
// 让「导出 JSON」在任何环境都有明确反馈，不再出现"点了没反应"。
// - 打包 App 后（Capacitor 原生）：把备份写入设备「文档」目录（文件管理器可见），
//   并返回真实保存路径；公共目录写入失败时降级到应用内部存储，保证备份不丢。
// - 网页版（PWA / 浏览器）：保持浏览器下载，返回文件名供界面明确提示。
// 业务代码只调用本模块，无需关心平台差异。

import { backupFilename, downloadText } from '../utils/exportImport';

export interface ExportOutcome {
  ok: boolean;
  /** 面向用户的一句话说明 */
  message: string;
  /** 保存位置：原生完整路径或网页端提示文本 */
  location?: string;
  /** 备份文件名 */
  filename: string;
}

function isNativePlatform(): boolean {
  try {
    return !!(
      typeof window !== 'undefined' &&
      (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
        .Capacitor?.isNativePlatform?.()
    );
  } catch {
    return false;
  }
}

/** 原生端：写入设备存储。优先公共「文档」目录，失败降级到应用内部存储。 */
async function saveToDevice(json: string): Promise<ExportOutcome> {
  const filename = backupFilename();
  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');

  const platform = (window as unknown as { Capacitor?: { getPlatform?: () => string } })
    .Capacitor?.getPlatform?.();
  const base = { path: filename, data: json, encoding: Encoding.UTF8, recursive: true };

  // 第一优先：公共「文档」目录（Android 映射到 /storage/emulated/0/Documents），用户能在文件管理器里直接看到
  try {
    if (platform === 'android') {
      // Android 11+ 写公共目录需要存储权限；先检查，未授予则请求一次
      const status = await Filesystem.checkPermissions();
      if (status.publicStorage !== 'granted') {
        const req = await Filesystem.requestPermissions();
        if (req.publicStorage !== 'granted') {
          throw new Error('public storage permission denied');
        }
      }
    }
    await Filesystem.writeFile({ ...base, directory: Directory.Documents });
    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Documents });
    return { ok: true, message: '已保存到手机，可以放心换机。', location: uri, filename };
  } catch {
    /* 公共目录写入失败（权限被拒 / 系统限制），降级到应用内部存储 */
  }

  // 降级：应用私有目录，一定可写
  try {
    await Filesystem.writeFile({ ...base, directory: Directory.Data });
    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Data });
    return { ok: true, message: '公共目录暂不可写，已保存到应用内部存储。', location: uri, filename };
  } catch {
    return { ok: false, message: '写入设备存储失败，请稍后再试。', filename };
  }
}

/** 统一出口：按当前环境导出备份，返回结果供界面展示 */
export async function exportBackup(json: string): Promise<ExportOutcome> {
  const filename = backupFilename();
  if (isNativePlatform()) {
    return saveToDevice(json);
  }
  // 网页版：浏览器静默下载，把文件名与去向带回来，界面给出明确提示
  downloadText(filename, json);
  return {
    ok: true,
    message: '备份已生成。',
    location: '已下载到浏览器的默认下载文件夹',
    filename,
  };
}
