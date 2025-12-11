import crypto from 'crypto';
import { CONSTANTS } from './constants';

export class AddressGenerator {
  private static readonly CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

  static generateRandom(): string {
    const bytes = crypto.randomBytes(CONSTANTS.ADDRESS.RANDOM_LENGTH);
    let result = '';

    for (let i = 0; i < CONSTANTS.ADDRESS.RANDOM_LENGTH; i++) {
      result += this.CHARS[bytes[i] % this.CHARS.length];
    }

    return result;
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  static generateFileId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
