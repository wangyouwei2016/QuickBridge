import { useEffect, useRef, useState } from 'react';
import { QRCodeGenerator } from '@extension/sync-service';

interface QRCodeDisplayProps {
  address: string;
  baseUrl?: string;
}

export const QRCodeDisplay = ({ address, baseUrl = 'https://sync.ulises.cn' }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setError(null);
        const dataUrl = await QRCodeGenerator.generate(address, baseUrl);
        setQrDataUrl(dataUrl);

        if (canvasRef.current) {
          await QRCodeGenerator.generateCanvas(address, canvasRef.current, baseUrl);
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
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">扫码访问</h3>
      <div className="flex flex-col items-center">
        <canvas ref={canvasRef} className="mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
          {baseUrl}?address={address}
        </p>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors"
        >
          下载二维码
        </button>
      </div>
    </div>
  );
};
