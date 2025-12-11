import { TransferItem, syncService, FileUtils } from '@extension/sync-service';

interface FileListProps {
  items: TransferItem[];
  address: string;
  onError: (error: string) => void;
}

export const FileList = ({ items, address, onError }: FileListProps) => {
  const handleDownload = async (item: TransferItem) => {
    if (item.type !== 'file') return;

    try {
      const blob = await syncService.file.download(address, item.id);
      await FileUtils.downloadBlob(blob, item.filename || 'download');
    } catch (err) {
      onError(err instanceof Error ? err.message : '下载失败');
    }
  };

  const handleCopyText = (item: TransferItem) => {
    if (item.type === 'text' && item.preview) {
      navigator.clipboard.writeText(item.preview);
    }
  };

  const files = items.filter(item => item.type === 'file');
  const textItems = items.filter(item => item.type === 'text');

  if (items.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">传输列表</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        传输列表 ({items.length})
      </h3>

      <div className="space-y-2">
        {textItems.map(item => (
          <div
            key={item.id}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">文本</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.preview}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {FileUtils.formatDate(item.createdAt)}
                </p>
              </div>
              <button
                onClick={() => handleCopyText(item)}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                复制
              </button>
            </div>
          </div>
        ))}

        {files.map(item => (
          <div
            key={item.id}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {item.filename}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                  <span>{item.size ? FileUtils.formatFileSize(item.size) : '-'}</span>
                  <span>{FileUtils.formatDate(item.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(item)}
                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                下载
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
