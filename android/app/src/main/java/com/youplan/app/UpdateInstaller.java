package com.youplan.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Environment;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * App 内下载更新包并拉起系统安装界面。
 * 下载到应用 cache（无需存储权限），完成后通过 FileProvider 授权给系统安装器。
 */
@CapacitorPlugin(name = "UpdateInstaller")
public class UpdateInstaller extends Plugin {

  @PluginMethod
  public void downloadAndInstall(PluginCall call) {
    String url = call.getString("url");
    if (url == null || url.isEmpty()) {
      call.reject("url required");
      return;
    }
    new Thread(() -> {
      File apk = null;
      try {
        File dir = new File(getContext().getCacheDir(), "updates");
        if (!dir.exists() && !dir.mkdirs()) {
          throw new Exception("cannot create cache dir");
        }
        apk = new File(dir, "youplan-update.apk");

        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(20000);
        conn.setReadTimeout(30000);
        conn.connect();

        int code = conn.getResponseCode();
        if (code < 200 || code >= 300) {
          throw new Exception("server returned " + code);
        }
        long total = conn.getContentLength();

        try (InputStream in = conn.getInputStream();
             FileOutputStream out = new FileOutputStream(apk)) {
          byte[] buf = new byte[8192];
          int len;
          long done = 0;
          while ((len = in.read(buf)) != -1) {
            out.write(buf, 0, len);
            done += len;
            final int pct = total > 0 ? (int) (done * 100 / total) : 0;
            getActivity().runOnUiThread(() -> {
              JSObject ret = new JSObject();
              ret.put("progress", Math.min(pct, 100));
              notifyListeners("downloadProgress", ret);
            });
          }
        }

        final File finalApk = apk;
        getActivity().runOnUiThread(() -> {
          try {
            Uri contentUri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                finalApk);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve(new JSObject().put("installed", true));
          } catch (Exception e) {
            call.reject("install_failed: " + e.getMessage());
          }
        });
      } catch (Exception e) {
        final String msg = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
        getActivity().runOnUiThread(() -> call.reject("download_failed: " + msg));
      }
    }).start();
  }
}
