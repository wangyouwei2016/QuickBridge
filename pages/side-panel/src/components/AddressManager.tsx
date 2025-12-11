import { useState } from 'react';
import { cn } from '@extension/ui';

interface AddressManagerProps {
  currentAddress: string | null;
  recentAddresses: string[];
  onGenerateRandom: () => Promise<string>;
  onCreateCustom: (address: string) => Promise<string>;
  onJoin: (address: string) => Promise<string>;
  onLeave: () => void;
  isLoading: boolean;
}

export const AddressManager = ({
  currentAddress,
  recentAddresses,
  onGenerateRandom,
  onCreateCustom,
  onJoin,
  onLeave,
  isLoading,
}: AddressManagerProps) => {
  const [customAddress, setCustomAddress] = useState('');
  const [joinAddress, setJoinAddress] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRandom = async () => {
    try {
      setError(null);
      await onGenerateRandom();
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成地址失败');
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim()) return;

    try {
      setError(null);
      await onCreateCustom(customAddress.trim());
      setCustomAddress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建地址失败');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinAddress.trim()) return;

    try {
      setError(null);
      await onJoin(joinAddress.trim());
      setJoinAddress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入地址失败');
    }
  };

  const handleSelectRecent = async (address: string) => {
    try {
      setError(null);
      await onJoin(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入地址失败');
    }
  };

  if (currentAddress) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">当前地址</h3>
          <button
            onClick={onLeave}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            离开
          </button>
        </div>
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded font-mono text-lg text-center">
          {currentAddress}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('create')}
          className={cn(
            'flex-1 py-2 px-4 rounded font-medium transition-colors',
            mode === 'create'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          )}
        >
          创建地址
        </button>
        <button
          onClick={() => setMode('join')}
          className={cn(
            'flex-1 py-2 px-4 rounded font-medium transition-colors',
            mode === 'join'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          )}
        >
          加入地址
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      {mode === 'create' ? (
        <div className="space-y-3">
          <button
            onClick={handleGenerateRandom}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
          >
            {isLoading ? '生成中...' : '生成随机地址'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">或</span>
            </div>
          </div>

          <form onSubmit={handleCreateCustom} className="space-y-2">
            <input
              type="text"
              value={customAddress}
              onChange={e => setCustomAddress(e.target.value)}
              placeholder="自定义地址 (5位以上)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              minLength={5}
              maxLength={20}
              pattern="[a-zA-Z0-9]+"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !customAddress.trim()}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
            >
              {isLoading ? '创建中...' : '创建自定义地址'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          <form onSubmit={handleJoin} className="space-y-2">
            <input
              type="text"
              value={joinAddress}
              onChange={e => setJoinAddress(e.target.value)}
              placeholder="输入地址"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !joinAddress.trim()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
            >
              {isLoading ? '加入中...' : '加入地址'}
            </button>
          </form>

          {recentAddresses.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">最近使用</h4>
              <div className="space-y-1">
                {recentAddresses.map(addr => (
                  <button
                    key={addr}
                    onClick={() => handleSelectRecent(addr)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm font-mono transition-colors"
                  >
                    {addr}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
