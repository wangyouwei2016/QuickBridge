import { AddressGenerator } from '../utils/address-generator';
import { validateAddress } from '../utils/validators';
import { storageService } from './storage.service';
import { CONSTANTS } from '../utils/constants';
import { AppError } from '../middleware/error-handler';

export class AddressService {
  async generateRandomAddress(): Promise<string> {
    let attempts = 0;

    while (attempts < CONSTANTS.ADDRESS.COLLISION_RETRY_MAX) {
      const address = AddressGenerator.generateRandom();
      const exists = await storageService.addressExists(address);

      if (!exists) {
        await storageService.createAddress(address, false);
        return address;
      }

      attempts++;
    }

    throw new AppError(500, 'Failed to generate unique address after multiple attempts');
  }

  async createCustomAddress(address: string): Promise<string> {
    if (!validateAddress(address)) {
      throw new AppError(400, 'Invalid address format');
    }

    const exists = await storageService.addressExists(address);
    if (exists) {
      throw new AppError(409, 'Address already exists');
    }

    await storageService.createAddress(address, true);
    return address;
  }

  async checkAddressStatus(address: string): Promise<{ exists: boolean; address?: string }> {
    const exists = await storageService.addressExists(address);

    if (exists) {
      // Update last accessed time
      await storageService.getAddress(address);
    }

    return { exists, address: exists ? address : undefined };
  }
}

export const addressService = new AddressService();
