import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'll9equhn',
  api_key: process.env.CLOUDINARY_API_KEY || '654929886339698',
  api_secret: process.env.CLOUDINARY_API_SECRET || '1xAbTDh3NOnlNEzTtRV7vXWtHPY',
  secure: true
});

const videoFilePath = 'C:/Users/lenovo/Desktop/Manjula mam.mp4';

console.log('Uploading 233MB video to Cloudinary...');
console.log('Account:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.uploader.upload_large(
  videoFilePath,
  {
    resource_type: 'video',
    folder: 'swayamkrushi/videos',
    public_id: 'manjula_mam_video',
    chunk_size: 6000000, // 6MB chunks for reliability
    overwrite: true
  },
  (error, result) => {
    if (error) {
      console.error('Upload Error:', error);
      process.exit(1);
    }
    console.log('\n========================================');
    console.log('UPLOAD COMPLETE!');
    console.log('Secure URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    console.log('Format:', result.format);
    console.log('Duration:', result.duration, 'seconds');
    console.log('Size:', (result.bytes / (1024 * 1024)).toFixed(2), 'MB');
    console.log('========================================\n');
    process.exit(0);
  }
);
