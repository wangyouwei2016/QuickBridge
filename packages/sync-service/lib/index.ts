import { AddressApi } from './api/address.api';
import { ApiClient } from './api/client';
import { FileApi } from './api/file.api';
import { TextApi } from './api/text.api';
import { SyncStorage } from './storage/sync-storage';
import { FileUtils } from './utils/file-utils';
import { QRCodeGenerator } from './utils/qrcode';

export type * from './types';
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
// Note: The actual API URL is configured in the root .env file (VITE_API_BASE_URL)
// This default value matches the production URL from .env
export const syncService = new SyncService('https://sync.ulises.cn/api/v1');

// Export utilities
export const qrcode = QRCodeGenerator;
export const fileUtils = FileUtils;
export const storage = SyncStorage;
