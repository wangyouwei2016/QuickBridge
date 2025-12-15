import { asyncHandler, AppError } from '../middleware/error-handler';
import { storageService } from '../services/storage.service';
import { textDataSchema } from '../utils/validators';
import type { Request, Response } from 'express';

export class TextController {
  saveText = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    const { content } = textDataSchema.parse(req.body);

    // Ensure address exists
    const addressExists = await storageService.addressExists(address);
    if (!addressExists) {
      throw new AppError(404, 'Address not found');
    }

    const textData = await storageService.saveText(address, content);

    res.json({
      success: true,
      data: textData,
      message: 'Text saved successfully',
    });
  });

  getText = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;

    // Ensure address exists and update last accessed time
    await storageService.getAddress(address);

    const texts = await storageService.getTextsList(address);

    res.json({
      success: true,
      data: { texts },
      message: texts.length === 0 ? 'No text data found for this address' : undefined,
    });
  });

  getTextById = asyncHandler(async (req: Request, res: Response) => {
    const { address, id } = req.params;

    // Update last accessed time
    await storageService.getAddress(address);

    const textData = await storageService.getTextMetadata(address, id);

    if (!textData) {
      throw new AppError(404, 'Text not found');
    }

    res.json({
      success: true,
      data: textData,
    });
  });

  deleteText = asyncHandler(async (req: Request, res: Response) => {
    const { address, id } = req.params;

    // Update last accessed time
    await storageService.getAddress(address);

    await storageService.deleteText(address, id);

    res.json({
      success: true,
      message: 'Text deleted successfully',
    });
  });
}

export const textController = new TextController();
