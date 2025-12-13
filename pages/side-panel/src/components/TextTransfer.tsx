import { syncService } from '@extension/sync-service';
import { useState, useEffect } from 'react';

interface TextTransferProps {
  address: string;
  onError: (error: string) => void;
}

export const TextTransfer = ({ address, onError }: TextTransferProps) => {
  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
        setText(''); // Clear input after successful save
      } else {
        onError(response.error || '保存失败');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(savedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Hide success message after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasChanges = text !== savedText;

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">文本传输</h3>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">加载中...</div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="输入要传输的文本..."
            className="h-24 w-full resize-none rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges || !text.trim()}
              className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400">
              {isSaving ? '保存中...' : hasChanges ? '保存' : '已保存'}
            </button>

            {savedText && (
              <button
                onClick={handleCopy}
                className={`rounded px-4 py-2 transition-colors ${
                  copySuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                }`}>
                {copySuccess ? '已复制!' : '复制'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
