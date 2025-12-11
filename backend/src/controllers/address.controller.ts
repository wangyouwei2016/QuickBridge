import { Request, Response } from 'express';
import { addressService } from '../services/address.service';
import { asyncHandler } from '../middleware/error-handler';
import { customAddressSchema } from '../utils/validators';

export class AddressController {
  generateRandom = asyncHandler(async (req: Request, res: Response) => {
    const address = await addressService.generateRandomAddress();

    res.json({
      success: true,
      data: { address },
      message: 'Random address generated successfully',
    });
  });

  createCustom = asyncHandler(async (req: Request, res: Response) => {
    const { address } = customAddressSchema.parse(req.body);
    const createdAddress = await addressService.createCustomAddress(address);

    res.json({
      success: true,
      data: { address: createdAddress },
      message: 'Custom address created successfully',
    });
  });

  checkStatus = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    const status = await addressService.checkAddressStatus(address);

    res.json({
      success: true,
      data: status,
    });
  });
}

export const addressController = new AddressController();
