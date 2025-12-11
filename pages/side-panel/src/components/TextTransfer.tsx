import { useState, useEffect } from 'react';
import { syncService } from '@extension/sync-service';

interface TextTransferProps {
  address: string;
  onError: (error: string) => void;
}

export const TextTransfer = ({ address, onError }: TextTransferProps) => {
  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchText = async () => {
      if (!address) return;

      setIsLoading(true);
      try {
        const response = await syncService.text.get(address);
        if (response.success && response.data) {
          setSavedText(response.data.content);
          setText(response.data.content);
        }
      } catch (err) {
        console.error('Failed to fetch text:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchText();
  }, [address]);

  const handleSave = async () => {
    if (!text.trim()) return;

    setIsSaving(true);
    try {
      const response = await syncService.text.save(address, text);
      if (response.success) {
        setSavedText(text);
      } else {
        onError(response.error || '保存失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(savedText);
  };

  const hasChanges = text !== savedText;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">文本传输</h3>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="输入要传输的文本..."
            className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges || !text.trim()}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
            >
              {isSaving ? '保存中...' : hasChanges ? '保存' : '已保存'}
            </button>

            {savedText && (
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors"
              >
                复制
              </button>
            )}
          </div>

          {savedText && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              字符数: {savedText.length} / 1,048,576
            </div>
          )}
        </div>
      )}
    </div>
  );
};
