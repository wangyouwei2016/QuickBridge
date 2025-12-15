import { asyncHandler, AppError } from '../middleware/error-handler';
import { fileService } from '../services/file.service';
import { storageService } from '../services/storage.service';
import { CONSTANTS } from '../utils/constants';
import type { TransferItem } from '../types';
import type { Request, Response } from 'express';

export class FileController {
  uploadFile = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;

    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    // Ensure address exists
    const addressExists = await storageService.addressExists(address);
    if (!addressExists) {
      throw new AppError(404, 'Address not found');
    }

    const metadata = await fileService.saveFile(address, req.file);

    res.json({
      success: true,
      data: metadata,
      message: 'File uploaded successfully',
    });
  });

  downloadFile = asyncHandler(async (req: Request, res: Response) => {
    const { address, id } = req.params;

    // Update last accessed time
    await storageService.getAddress(address);

    const metadata = await fileService.getFile(address, id);

    // 正确处理中文文件名，使用 RFC 5987 编码
    const encodedFileName = encodeURIComponent(metadata.originalName);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
    res.download(metadata.path, metadata.originalName);
  });

  listData = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;

    // Update last accessed time
    await storageService.getAddress(address);

    const texts = await storageService.getTextsList(address);
    const files = await storageService.getFilesList(address);

    const items: TransferItem[] = [];

    // Add all text data
    texts.forEach(textData => {
      items.push({
        id: textData.id,
        type: 'text',
        createdAt: textData.createdAt,
        preview: textData.content.substring(0, CONSTANTS.DATA.TEXT_PREVIEW_LENGTH),
      });
    });

    // Add files
    files.forEach(file => {
      items.push({
        id: file.id,
        type: 'file',
        createdAt: file.createdAt,
        size: file.size,
        filename: file.originalName,
      });
    });

    // Sort by creation time (newest first)
    items.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      data: { items },
    });
  });

  deleteFile = asyncHandler(async (req: Request, res: Response) => {
    const { address, id } = req.params;

    // Update last accessed time
    await storageService.getAddress(address);

    await fileService.deleteFile(address, id);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  });

  deleteData = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;

    // Delete all texts
    await storageService.deleteAllTexts(address);

    // Delete all files
    await fileService.deleteAllFiles(address);

    // Delete address
    await storageService.deleteAddress(address);

    res.json({
      success: true,
      message: 'All data deleted successfully',
    });
  });
}

export const fileController = new FileController();
