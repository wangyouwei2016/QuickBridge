import { useState, useRef } from 'react';
import { syncService, FileUtils } from '@extension/sync-service';

interface FileUploadProps {
  address: string;
  onUploadComplete: () => void;
  onError: (error: string) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const FileUpload = ({ address, onUploadComplete, onError }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!FileUtils.validateFileSize(file, MAX_FILE_SIZE)) {
      onError(`文件大小超过限制 (最大 ${FileUtils.formatFileSize(MAX_FILE_SIZE)})`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(file.name);

    try {
      await syncService.file.upload(address, file, progress => {
        setUploadProgress(progress.percentage);
      });

      onUploadComplete();
      setUploadProgress(0);
      setUploadingFileName('');

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">文件上传</h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="text-gray-700 dark:text-gray-300 font-medium">上传中...</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{uploadingFileName}</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</div>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              拖拽文件到这里或点击选择
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              最大 {FileUtils.formatFileSize(MAX_FILE_SIZE)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
