import { syncService, FileUtils } from '@extension/sync-service';
import { useState } from 'react';
import type { TransferItem } from '@extension/sync-service';

interface FileListProps {
  items: TransferItem[];
  address: string;
  onError: (error: string) => void;
  onRefresh?: () => void;
}

export const FileList = ({ items, address, onError, onRefresh }: FileListProps) => {
  const [expandedTextId, setExpandedTextId] = useState<string | null>(null);
  const [fullTextContent, setFullTextContent] = useState<{ [key: string]: string }>({});
  const [loadingTextId, setLoadingTextId] = useState<string | null>(null);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadedItemId, setDownloadedItemId] = useState<string | null>(null);

  const handleDownload = async (item: TransferItem) => {
    if (item.type !== 'file') return;

    try {
      const blob = await syncService.file.download(address, item.id);
      await FileUtils.downloadBlob(blob, item.filename || 'download');
      setDownloadedItemId(item.id);
      setTimeout(() => setDownloadedItemId(null), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : '下载失败');
    }
  };

  const handleToggleText = async (item: TransferItem) => {
    if (item.type !== 'text') return;

    // If already expanded, collapse it
    if (expandedTextId === item.id) {
      setExpandedTextId(null);
      return;
    }

    // If we already have the full content, just expand it
    if (fullTextContent[item.id]) {
      setExpandedTextId(item.id);
      return;
    }

    // Otherwise, fetch the full content
    setLoadingTextId(item.id);
    try {
      const response = await syncService.text.getById(address, item.id);
      if (response.success && response.data) {
        setFullTextContent(prev => ({ ...prev, [item.id]: response.data.content }));
        setExpandedTextId(item.id);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '加载文本失败');
    } finally {
      setLoadingTextId(null);
    }
  };

  const handleCopyText = async (item: TransferItem) => {
    if (item.type !== 'text') return;

    try {
      // If we have the full content, copy it; otherwise copy the preview
      const textToCopy = fullTextContent[item.id] || item.preview || '';

      // If we only have preview and it's truncated, fetch full content first
      if (!fullTextContent[item.id] && item.preview && item.preview.length >= 100) {
        const response = await syncService.text.getById(address, item.id);
        if (response.success && response.data) {
          await navigator.clipboard.writeText(response.data.content);
          setFullTextContent(prev => ({ ...prev, [item.id]: response.data.content }));
          setCopiedItemId(item.id);
          setTimeout(() => setCopiedItemId(null), 2000);
          return;
        }
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopiedItemId(item.id);
      setTimeout(() => setCopiedItemId(null), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : '复制失败');
    }
  };

  const handleDelete = async (item: TransferItem) => {
    if (!confirm(`确定要删除这个${item.type === 'file' ? '文件' : '文本'}吗？`)) {
      return;
    }

    setDeletingItemId(item.id);
    try {
      if (item.type === 'file') {
        await syncService.file.deleteFile(address, item.id);
      } else {
        await syncService.text.deleteText(address, item.id);
      }
      onRefresh?.();
    } catch (err) {
      onError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleDownloadAll = async () => {
    const filesToDownload = files;
    if (filesToDownload.length === 0) {
      onError('没有可下载的文件');
      return;
    }

    setDownloadingAll(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of filesToDownload) {
      try {
        const blob = await syncService.file.download(address, item.id);
        await FileUtils.downloadBlob(blob, item.filename || 'download');
        successCount++;
        // Add a small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        failCount++;
        console.error(`Failed to download ${item.filename}:`, err);
      }
    }

    setDownloadingAll(false);

    if (failCount > 0) {
      onError(`批量下载完成：成功 ${successCount} 个，失败 ${failCount} 个`);
    }
  };

  const files = items.filter(item => item.type === 'file');
  const textItems = items.filter(item => item.type === 'text');

  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">传输列表</h3>
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">传输列表 ({items.length})</h3>
        {files.length > 0 && (
          <button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="rounded bg-purple-600 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-700 disabled:bg-gray-400">
            {downloadingAll ? '下载中...' : `批量下载 (${files.length})`}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {textItems.map(item => {
          const isExpanded = expandedTextId === item.id;
          const isLoading = loadingTextId === item.id;
          const displayText = isExpanded ? fullTextContent[item.id] : item.preview;

          return (
            <div
              key={item.id}
              className="rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                      <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">文本</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{FileUtils.formatDate(item.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleText(item)}
                    disabled={isLoading}
                    className="rounded bg-gray-600 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700 disabled:bg-gray-400">
                    {isLoading ? '加载中...' : isExpanded ? '收起' : '展开'}
                  </button>
                  <button
                    onClick={() => handleCopyText(item)}
                    className={`rounded px-3 py-1 text-sm text-white transition-colors ${
                      copiedItemId === item.id ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}>
                    {copiedItemId === item.id ? '已复制!' : '复制'}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingItemId === item.id}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
                    {deletingItemId === item.id ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>
              <div
                className={`text-sm text-gray-600 dark:text-gray-400 ${
                  isExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'
                }`}>
                {displayText}
              </div>
            </div>
          );
        })}

        {files.map(item => (
          <div
            key={item.id}
            className="rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 flex-shrink-0 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <div className="break-words text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.filename}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                    <span>{item.size ? FileUtils.formatFileSize(item.size) : '-'}</span>
                    <span>{FileUtils.formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(item)}
                  className={`flex-1 rounded px-3 py-1 text-sm text-white transition-colors ${
                    downloadedItemId === item.id ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-600 hover:bg-green-700'
                  }`}>
                  {downloadedItemId === item.id ? '已下载!' : '下载'}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingItemId === item.id}
                  className="flex-1 rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
                  {deletingItemId === item.id ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
