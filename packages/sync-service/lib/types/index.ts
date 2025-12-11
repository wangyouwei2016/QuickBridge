export interface AddressRecord {
  address: string;
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
  isCustom: boolean;
}

export interface TextData {
  id: string;
  address: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface FileMetadata {
  id: string;
  address: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: number;
}

export interface TransferItem {
  id: string;
  type: 'text' | 'file';
  createdAt: number;
  size?: number;
  filename?: string;
  preview?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SyncState {
  currentAddress: string | null;
  recentAddresses: string[];
  transferHistory: TransferItem[];
  preferences: {
    autoSync: boolean;
    pollInterval: number;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
