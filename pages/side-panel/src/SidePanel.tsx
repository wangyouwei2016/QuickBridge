import '@src/SidePanel.css';
import { AddressManager } from './components/AddressManager';
import { FileList } from './components/FileList';
import { FileUpload } from './components/FileUpload';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { TextTransfer } from './components/TextTransfer';
import { usePolling } from './hooks/usePolling';
import { useSyncService } from './hooks/useSyncService';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';

const SidePanel = () => {
  const [error, setError] = useState<string | null>(null);
  const syncService = useSyncService();
  const polling = usePolling(syncService.currentAddress, !!syncService.currentAddress);

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Header */}
        <div className="py-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">QuickBridge</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">跨设备数据传输</p>
        </div>

        {/* Error Display */}
        {(error || syncService.error || polling.error) && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error || syncService.error || polling.error}
          </div>
        )}

        {/* Address Manager */}
        <AddressManager
          currentAddress={syncService.currentAddress}
          recentAddresses={syncService.recentAddresses}
          onGenerateRandom={syncService.generateRandomAddress}
          onCreateCustom={syncService.createCustomAddress}
          onJoin={syncService.joinAddress}
          onLeave={syncService.leaveAddress}
          isLoading={syncService.isLoading}
        />

        {/* QR Code Display with Current Address */}
        {syncService.currentAddress && (
          <QRCodeDisplay address={syncService.currentAddress} onLeave={syncService.leaveAddress} />
        )}

        {/* Text Transfer */}
        {syncService.currentAddress && <TextTransfer address={syncService.currentAddress} onError={handleError} />}

        {/* File Upload */}
        {syncService.currentAddress && (
          <FileUpload address={syncService.currentAddress} onUploadComplete={polling.refresh} onError={handleError} />
        )}

        {/* File List */}
        {syncService.currentAddress && (
          <FileList
            items={polling.items}
            address={syncService.currentAddress}
            onError={handleError}
            onRefresh={polling.refresh}
          />
        )}

        {/* Sync Status */}
        {syncService.currentAddress && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {polling.isPolling ? '🟢 实时同步中' : '🔴 未连接'}
          </div>
        )}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
