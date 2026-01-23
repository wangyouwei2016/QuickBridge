import { syncService, FileUtils } from '@extension/sync-service';
import { useState, useRef } from 'react';

interface FileUploadProps {
  address: string;
  onUploadComplete: () => void;
  onError: (error: string) => void;
}

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

export const FileUpload = ({ address, onUploadComplete, onError }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
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
      handleFilesSelected(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelected(Array.from(files));
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    // Validate all files first
    const validFiles: File[] = [];
    for (const file of files) {
      if (!FileUtils.validateFileSize(file, MAX_FILE_SIZE)) {
        onError(`文件 "${file.name}" 大小超过限制 (最大 ${FileUtils.formatFileSize(MAX_FILE_SIZE)})`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Upload files sequentially
    setUploadQueue(validFiles);
    setCurrentFileIndex(0);
    await uploadFiles(validFiles);
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFileIndex(i);
      setUploadProgress(0);
      setUploadingFileName(file.name);

      try {
        await syncService.file.upload(address, file, progress => {
          setUploadProgress(progress.percentage);
        });
      } catch (err) {
        onError(`上传 "${file.name}" 失败: ${err instanceof Error ? err.message : '未知错误'}`);
      }
    }

    // All uploads complete
    onUploadComplete();
    setUploadProgress(0);
    setUploadingFileName('');
    setUploadQueue([]);
    setCurrentFileIndex(0);
    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">文件上传</h3>

      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''} `}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="font-medium text-gray-700 dark:text-gray-300">
              上传中 ({currentFileIndex + 1}/{uploadQueue.length})
            </div>
            <div className="truncate text-sm text-gray-500 dark:text-gray-400">{uploadingFileName}</div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</div>
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">拖拽文件到这里或点击选择</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              支持多文件上传，单个文件最大 {FileUtils.formatFileSize(MAX_FILE_SIZE)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
