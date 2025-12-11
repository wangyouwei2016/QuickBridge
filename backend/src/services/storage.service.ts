import { getRedisClient } from '../config/redis';
import { CONSTANTS } from '../utils/constants';
import { AddressRecord, TextData, FileMetadata } from '../types';
import { env } from '../config/env';

export class StorageService {
  private async getClient() {
    return await getRedisClient();
  }

  // Address operations
  async createAddress(address: string, isCustom: boolean): Promise<AddressRecord> {
    const client = await this.getClient();
    const now = Date.now();
    const ttlSeconds = env.ADDRESS_TTL_HOURS * 60 * 60;

    const record: AddressRecord = {
      address,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: now + ttlSeconds * 1000,
      isCustom,
    };

    await client.setEx(
      CONSTANTS.REDIS_KEYS.ADDRESS(address),
      ttlSeconds,
      JSON.stringify(record)
    );

    return record;
  }

  async getAddress(address: string): Promise<AddressRecord | null> {
    const client = await this.getClient();
    const data = await client.get(CONSTANTS.REDIS_KEYS.ADDRESS(address));

    if (!data) return null;

    const record: AddressRecord = JSON.parse(data);

    // Update last accessed time and extend TTL
    const now = Date.now();
    const ttlSeconds = env.ADDRESS_TTL_HOURS * 60 * 60;
    record.lastAccessedAt = now;
    record.expiresAt = now + ttlSeconds * 1000;

    await client.setEx(
      CONSTANTS.REDIS_KEYS.ADDRESS(address),
      ttlSeconds,
      JSON.stringify(record)
    );

    return record;
  }

  async addressExists(address: string): Promise<boolean> {
    const client = await this.getClient();
    const exists = await client.exists(CONSTANTS.REDIS_KEYS.ADDRESS(address));
    return exists === 1;
  }

  async deleteAddress(address: string): Promise<void> {
    const client = await this.getClient();
    await client.del(CONSTANTS.REDIS_KEYS.ADDRESS(address));
  }

  // Text data operations
  async saveText(address: string, content: string): Promise<TextData> {
    const client = await this.getClient();
    const now = Date.now();
    const ttlSeconds = env.ADDRESS_TTL_HOURS * 60 * 60;

    const textData: TextData = {
      id: `text-${now}`,
      address,
      content,
      createdAt: now,
      updatedAt: now,
    };

    await client.setEx(
      CONSTANTS.REDIS_KEYS.TEXT(address),
      ttlSeconds,
      JSON.stringify(textData)
    );

    return textData;
  }

  async getText(address: string): Promise<TextData | null> {
    const client = await this.getClient();
    const data = await client.get(CONSTANTS.REDIS_KEYS.TEXT(address));

    if (!data) return null;
    return JSON.parse(data);
  }

  async deleteText(address: string): Promise<void> {
    const client = await this.getClient();
    await client.del(CONSTANTS.REDIS_KEYS.TEXT(address));
  }

  // File metadata operations
  async saveFileMetadata(metadata: FileMetadata): Promise<void> {
    const client = await this.getClient();
    const ttlSeconds = env.ADDRESS_TTL_HOURS * 60 * 60;

    // Save individual file metadata
    await client.setEx(
      CONSTANTS.REDIS_KEYS.FILE_META(metadata.address, metadata.id),
      ttlSeconds,
      JSON.stringify(metadata)
    );

    // Add to files list for this address
    await client.sAdd(CONSTANTS.REDIS_KEYS.FILES(metadata.address), metadata.id);
    await client.expire(CONSTANTS.REDIS_KEYS.FILES(metadata.address), ttlSeconds);
  }

  async getFileMetadata(address: string, fileId: string): Promise<FileMetadata | null> {
    const client = await this.getClient();
    const data = await client.get(CONSTANTS.REDIS_KEYS.FILE_META(address, fileId));

    if (!data) return null;
    return JSON.parse(data);
  }

  async getFilesList(address: string): Promise<FileMetadata[]> {
    const client = await this.getClient();
    const fileIds = await client.sMembers(CONSTANTS.REDIS_KEYS.FILES(address));

    const files: FileMetadata[] = [];
    for (const fileId of fileIds) {
      const metadata = await this.getFileMetadata(address, fileId);
      if (metadata) {
        files.push(metadata);
      }
    }

    return files.sort((a, b) => b.createdAt - a.createdAt);
  }

  async deleteFile(address: string, fileId: string): Promise<void> {
    const client = await this.getClient();
    await client.del(CONSTANTS.REDIS_KEYS.FILE_META(address, fileId));
    await client.sRem(CONSTANTS.REDIS_KEYS.FILES(address), fileId);
  }

  async deleteAllFiles(address: string): Promise<string[]> {
    const client = await this.getClient();
    const fileIds = await client.sMembers(CONSTANTS.REDIS_KEYS.FILES(address));

    for (const fileId of fileIds) {
      await client.del(CONSTANTS.REDIS_KEYS.FILE_META(address, fileId));
    }

    await client.del(CONSTANTS.REDIS_KEYS.FILES(address));
    return fileIds;
  }
}

export const storageService = new StorageService();
