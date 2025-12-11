import { ApiClient } from './api/client';
import { AddressApi } from './api/address.api';
import { TextApi } from './api/text.api';
import { FileApi } from './api/file.api';
import { SyncStorage } from './storage/sync-storage';
import { QRCodeGenerator } from './utils/qrcode';
import { FileUtils } from './utils/file-utils';

export * from './types';
export { SyncStorage } from './storage/sync-storage';
export { QRCodeGenerator } from './utils/qrcode';
export { FileUtils } from './utils/file-utils';

export class SyncService {
  private client: ApiClient;
  public address: AddressApi;
  public text: TextApi;
  public file: FileApi;

  constructor(baseUrl: string) {
    this.client = new ApiClient(baseUrl);
    this.address = new AddressApi(this.client);
    this.text = new TextApi(this.client);
    this.file = new FileApi(this.client);
  }
}

// Create default instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export const syncService = new SyncService(API_BASE_URL);

// Export utilities
export const qrcode = QRCodeGenerator;
export const fileUtils = FileUtils;
export const storage = SyncStorage;
