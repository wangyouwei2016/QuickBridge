import { ApiClient } from './client';
import { ApiResponse } from '../types';

export class AddressApi {
  constructor(private client: ApiClient) {}

  async generateRandom(): Promise<ApiResponse<{ address: string }>> {
    return this.client.post('/address/random');
  }

  async createCustom(address: string): Promise<ApiResponse<{ address: string }>> {
    return this.client.post('/address/custom', { address });
  }

  async checkStatus(address: string): Promise<ApiResponse<{ exists: boolean; address?: string }>> {
    return this.client.get(`/address/${address}/status`);
  }
}
