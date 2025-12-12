import * as QRCode from 'qrcode';

export class QRCodeGenerator {
  static async generate(address: string, baseUrl: string = 'https://sync.ulises.cn'): Promise<string> {
    const url = `${baseUrl}?address=${address}`;

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return dataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  static async generateCanvas(
    address: string,
    canvas: HTMLCanvasElement,
    baseUrl: string = 'https://sync.ulises.cn',
  ): Promise<void> {
    const url = `${baseUrl}?address=${address}`;

    try {
      await QRCode.toCanvas(canvas, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      console.error('Failed to generate QR code on canvas:', error);
      throw error;
    }
  }
}
