import { QRCodeGenerator } from '@extension/sync-service';
import { useEffect, useRef, useState } from 'react';

interface QRCodeDisplayProps {
  address: string;
  baseUrl?: string;
  onLeave?: () => void;
}

export const QRCodeDisplay = ({ address, baseUrl = 'https://sync.ulises.cn', onLeave }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setError(null);
        const qrSize = 96; // 96px for compact display
        const dataUrl = await QRCodeGenerator.generate(address, baseUrl, qrSize);
        setQrDataUrl(dataUrl);

        if (canvasRef.current) {
          await QRCodeGenerator.generateCanvas(address, canvasRef.current, baseUrl, qrSize);
        }
      } catch (err) {
        setError('生成二维码失败');
        console.error('QR code generation error:', err);
      }
    };

    if (address) {
      generateQR();
    }
  }, [address, baseUrl]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `quickbridge-${address}.png`;
    link.click();
  };

  if (error) {
    return <div className="rounded bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="rounded-lg bg-white p-3 shadow dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">当前地址</h3>
        {onLeave && (
          <button
            onClick={onLeave}
            className="rounded px-3 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
            离开
          </button>
        )}
      </div>
      <div className="mb-3 rounded bg-gray-100 p-2 text-center font-mono text-base font-semibold text-gray-900 dark:bg-gray-700 dark:text-gray-100">
        {address}
      </div>
      <div className="flex items-center gap-3">
        <canvas ref={canvasRef} className="h-24 w-24 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">扫码访问</h4>
          <p className="mb-2 break-all text-xs text-gray-500 dark:text-gray-500">
            {baseUrl}?address={address}
          </p>
          <button
            onClick={handleDownload}
            className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
            下载二维码
          </button>
        </div>
      </div>
    </div>
  );
};
