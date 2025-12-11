import { ApiClient } from './client';
import { ApiResponse, TextData } from '../types';

export class TextApi {
  constructor(private client: ApiClient) {}

  async save(address: string, content: string): Promise<ApiResponse<TextData>> {
    return this.client.post(`/data/${address}/text`, { content });
  }

  async get(address: string): Promise<ApiResponse<TextData | null>> {
    return this.client.get(`/data/${address}/text`);
  }
}
