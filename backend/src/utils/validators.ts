import { z } from 'zod';
import { CONSTANTS } from './constants';

export const addressSchema = z
  .string()
  .min(CONSTANTS.ADDRESS.MIN_CUSTOM_LENGTH)
  .max(CONSTANTS.ADDRESS.MAX_LENGTH)
  .regex(/^[a-zA-Z0-9]+$/, 'Address must contain only alphanumeric characters');

export const textDataSchema = z.object({
  content: z.string().max(CONSTANTS.DATA.MAX_TEXT_SIZE, 'Text content too large'),
});

export const customAddressSchema = z.object({
  address: addressSchema,
});

export const validateAddress = (address: string): boolean => {
  try {
    addressSchema.parse(address);
    return true;
  } catch {
    return false;
  }
};
