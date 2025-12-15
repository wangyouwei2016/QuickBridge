import type { ApiClient } from './client';
import type { ApiResponse, FileMetadata, TransferItem } from '../types';

export class FileApi {
  constructor(private client: ApiClient) {}

  async upload(
    address: string,
    file: File,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void,
  ): Promise<ApiResponse<FileMetadata>> {
    return this.client.uploadFile(`/data/${address}/file`, file, onProgress);
  }

  async download(address: string, fileId: string): Promise<Blob> {
    return this.client.downloadFile(`/data/${address}/file/${fileId}`);
  }

  async list(address: string): Promise<ApiResponse<{ items: TransferItem[] }>> {
    return this.client.get(`/data/${address}/list`);
  }

  async deleteFile(address: string, fileId: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/data/${address}/file/${fileId}`);
  }

  async deleteAll(address: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/data/${address}`);
  }
}
