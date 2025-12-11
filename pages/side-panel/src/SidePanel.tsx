import '@src/SidePanel.css';
import { useState } from 'react';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { AddressManager } from './components/AddressManager';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { TextTransfer } from './components/TextTransfer';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { useSyncService } from './hooks/useSyncService';
import { usePolling } from './hooks/usePolling';

const SidePanel = () => {
  const [error, setError] = useState<string | null>(null);
  const syncService = useSyncService();
  const polling = usePolling(syncService.currentAddress, !!syncService.currentAddress);

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">QuickBridge</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">跨设备数据传输</p>
        </div>

        {/* Error Display */}
        {(error || syncService.error || polling.error) && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
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

        {/* QR Code Display */}
        {syncService.currentAddress && <QRCodeDisplay address={syncService.currentAddress} />}

        {/* Text Transfer */}
        {syncService.currentAddress && (
          <TextTransfer address={syncService.currentAddress} onError={handleError} />
        )}

        {/* File Upload */}
        {syncService.currentAddress && (
          <FileUpload
            address={syncService.currentAddress}
            onUploadComplete={polling.refresh}
            onError={handleError}
          />
        )}

        {/* File List */}
        {syncService.currentAddress && (
          <FileList items={polling.items} address={syncService.currentAddress} onError={handleError} />
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
