import type { ApiClient } from './client';
import type { ApiResponse, TextData } from '../types';

export class TextApi {
  constructor(private client: ApiClient) {}

  async save(address: string, content: string): Promise<ApiResponse<TextData>> {
    return this.client.post(`/data/${address}/text`, { content });
  }

  async get(address: string): Promise<ApiResponse<{ texts: TextData[] }>> {
    return this.client.get(`/data/${address}/text`);
  }

  async getById(address: string, textId: string): Promise<ApiResponse<TextData>> {
    return this.client.get(`/data/${address}/text/${textId}`);
  }
}
