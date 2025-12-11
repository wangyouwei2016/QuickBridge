import { Request, Response } from 'express';
import { storageService } from '../services/storage.service';
import { asyncHandler, AppError } from '../middleware/error-handler';
import { textDataSchema } from '../utils/validators';

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

    const textData = await storageService.getText(address);

    if (!textData) {
      return res.json({
        success: true,
        data: null,
        message: 'No text data found for this address',
      });
    }

    res.json({
      success: true,
      data: textData,
    });
  });
}

export const textController = new TextController();
