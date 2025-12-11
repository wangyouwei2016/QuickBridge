import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { FileMetadata } from '../types';
import { storageService } from './storage.service';
import { AddressGenerator } from '../utils/address-generator';
import { AppError } from '../middleware/error-handler';

export class FileService {
  async ensureUploadDir(address: string): Promise<string> {
    const addressDir = path.join(env.UPLOAD_DIR, address);
    await fs.mkdir(addressDir, { recursive: true });
    return addressDir;
  }

  async saveFile(
    address: string,
    file: Express.Multer.File
  ): Promise<FileMetadata> {
    const fileId = AddressGenerator.generateFileId();
    const sanitizedName = AddressGenerator.sanitizeFilename(file.originalname);
    const filename = `${fileId}-${sanitizedName}`;

    const addressDir = await this.ensureUploadDir(address);
    const filePath = path.join(addressDir, filename);

    // Move file from temp location to final location
    await fs.rename(file.path, filePath);

    const metadata: FileMetadata = {
      id: fileId,
      address,
      filename,
      originalName: file.originalname,
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
    const fileIds = await storageService.deleteAllFiles(address);

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
