import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo-researchflow';
const apiKey = process.env.CLOUDINARY_API_KEY || '1234567890';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export interface WatermarkOptions {
  customerName: string;
  watermarkText?: string;
  expiresInSeconds?: number;
}

/**
 * Generates a signed Cloudinary URL with dynamic watermarking
 * Overlays: CONFIDENTIAL \n [Customer Name] \n FOR REVIEW ONLY
 */
export function generateWatermarkedPdfUrl(publicId: string, options: WatermarkOptions): string {
  const customerName = options.customerName || 'Authorized Scholar';
  const customWatermark = options.watermarkText || `CONFIDENTIAL\n${customerName}\nFOR REVIEW ONLY`;
  const encodedWatermark = encodeURIComponent(customWatermark);

  // Cloudinary dynamic overlay transformation for documents/images/PDFs
  // l_text:font_size_style:text, opacity, angle, color
  try {
    const url = cloudinary.url(publicId, {
      resource_type: 'image', // Cloudinary renders PDF pages as images or raw documents
      format: 'pdf',
      sign_url: true,
      secure: true,
      transformation: [
        {
          overlay: {
            font_family: 'Arial',
            font_size: 28,
            font_weight: 'bold',
            text: encodedWatermark,
            text_align: 'center',
          },
          color: '#333333',
          opacity: 22,
          angle: -30,
          flags: 'relative',
          width: '0.8',
          crop: 'scale',
        },
      ],
    });

    return url;
  } catch (error) {
    console.warn('Fallback generating Cloudinary URL:', error);
    return `https://res.cloudinary.com/${cloudName}/image/upload/s--signature--/fl_attachment:false/l_text:Arial_24_bold:${encodedWatermark},o_20,a_-30/${publicId}.pdf`;
  }
}

export { cloudinary };

