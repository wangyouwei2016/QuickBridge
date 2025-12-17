import { QRCodeGenerator } from '@extension/sync-service';
import { useEffect, useRef, useState } from 'react';

interface QRCodeDisplayProps {
  address: string;
  baseUrl?: string;
  onLeave?: () => void;
}

export const QRCodeDisplay = ({ address, baseUrl = 'https://sync.ulises.cn', onLeave }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setError(null);
        const qrSize = 96; // 96px for compact display

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

  const handleOpenWeb = () => {
    const url = `${baseUrl}?address=${address}`;
    window.open(url, '_blank');
  };

  if (error) {
    return <div className="rounded bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="rounded-lg bg-white p-3 shadow dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <canvas ref={canvasRef} className="h-24 w-24 flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">扫码访问</h4>
          <button
            onClick={handleOpenWeb}
            className="block text-xs text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
            网页访问
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">当前地址</span>
            <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-900 dark:bg-gray-700 dark:text-gray-100">
              {address}
            </span>
            {onLeave && (
              <button
                onClick={onLeave}
                className="rounded px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                离开
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
