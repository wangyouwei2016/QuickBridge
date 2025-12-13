import { cn } from '@extension/ui';
import { useState } from 'react';

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
    return null; // Address display is now handled by QRCodeDisplay
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleGenerateRandom}
          disabled={isLoading}
          className={cn(
            'flex-1 rounded px-4 py-2 font-medium transition-colors',
            mode === 'create'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          )}>
          {isLoading && mode === 'create' ? '生成中...' : '生成随机地址'}
        </button>
        <button
          onClick={() => setMode('join')}
          className={cn(
            'flex-1 rounded px-4 py-2 font-medium transition-colors',
            mode === 'join'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          )}>
          加入地址
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>
      )}

      {mode === 'create' ? (
        <div className="space-y-3">
          <form onSubmit={handleCreateCustom} className="space-y-2">
            <input
              type="text"
              value={customAddress}
              onChange={e => setCustomAddress(e.target.value)}
              placeholder="自定义地址 (5位以上)"
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              minLength={5}
              maxLength={20}
              pattern="[a-zA-Z0-9]+"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !customAddress.trim()}
              className="w-full rounded bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400">
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
              className="w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !joinAddress.trim()}
              className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400">
              {isLoading ? '加入中...' : '加入地址'}
            </button>
          </form>

          {recentAddresses.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">最近使用</h4>
              <div className="space-y-1">
                {recentAddresses.map(addr => (
                  <button
                    key={addr}
                    onClick={() => handleSelectRecent(addr)}
                    disabled={isLoading}
                    className="w-full rounded bg-gray-100 px-3 py-2 text-left font-mono text-sm transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
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
