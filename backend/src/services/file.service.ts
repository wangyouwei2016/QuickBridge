import { storageService } from './storage.service';
import { env } from '../config/env';
import { AppError } from '../middleware/error-handler';
import { AddressGenerator } from '../utils/address-generator';
import fs from 'fs/promises';
import path from 'path';
import type { FileMetadata } from '../types';

export class FileService {
  async ensureUploadDir(address: string): Promise<string> {
    const addressDir = path.join(env.UPLOAD_DIR, address);
    await fs.mkdir(addressDir, { recursive: true });
    return addressDir;
  }

  async saveFile(address: string, file: Express.Multer.File): Promise<FileMetadata> {
    const fileId = AddressGenerator.generateFileId();

    // 修复 Multer 的文件名编码问题
    // Multer 可能会将 UTF-8 编码的文件名错误地解析为 Latin1
    let originalName = file.originalname;
    try {
      // 尝试修复编码
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf-8');
    } catch (err) {
      // 如果转换失败，使用原始文件名
      console.warn('Failed to decode filename, using original:', err);
    }

    const sanitizedName = AddressGenerator.sanitizeFilename(originalName);
    const filename = `${fileId}-${sanitizedName}`;

    const addressDir = await this.ensureUploadDir(address);
    const filePath = path.join(addressDir, filename);

    // Move file from temp location to final location
    await fs.rename(file.path, filePath);

    const metadata: FileMetadata = {
      id: fileId,
      address,
      filename,
      originalName: originalName,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      createdAt: Date.now(),
    };

    await storageService.saveFileMetadata(metadata);
    return metadata;
  }

  async getFile(address: string, fileId: string): Promise<FileMetadata> {
    const metadata = await storageService.getFileMetadata(address, fileId);

    if (!metadata) {
      throw new AppError(404, 'File not found');
    }

    // Check if file exists on disk
    try {
      await fs.access(metadata.path);
    } catch {
      throw new AppError(404, 'File not found on disk');
    }

    return metadata;
  }

  async deleteFile(address: string, fileId: string): Promise<void> {
    const metadata = await storageService.getFileMetadata(address, fileId);

    if (metadata) {
      try {
        await fs.unlink(metadata.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }

      await storageService.deleteFile(address, fileId);
    }
  }

  async deleteAllFiles(address: string): Promise<void> {
    await storageService.deleteAllFiles(address);

    // Delete directory
    const addressDir = path.join(env.UPLOAD_DIR, address);
    try {
      await fs.rm(addressDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Error deleting directory:', err);
    }
  }

  async cleanupExpiredFiles(): Promise<void> {
    // This will be called by cleanup service
    // For now, we rely on Redis TTL and manual cleanup
    console.log('Cleanup job running...');
  }
}

export const fileService = new FileService();
