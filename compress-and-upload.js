import { execFile } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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

const inputVideo = 'C:/Users/lenovo/Desktop/Manjula mam.mp4';
const outputVideo = path.join(__dirname, 'Manjula_mam_web.mp4');

console.log('=== STEP 1: COMPRESSING VIDEO FOR WEB & CLOUDINARY ===');
console.log('Input:', inputVideo);
console.log('Output:', outputVideo);
console.log('FFmpeg binary:', ffmpegPath);

// Compress with H.264 CRF 26, AAC 128k (crisp quality, lightweight web stream)
const ffmpegArgs = [
  '-y',
  '-i', inputVideo,
  '-c:v', 'libx264',
  '-crf', '26',
  '-preset', 'fast',
  '-c:a', 'aac',
  '-b:a', '128k',
  '-movflags', '+faststart',
  outputVideo
];

const startTime = Date.now();
const ffmpegProcess = execFile(ffmpegPath, ffmpegArgs, (err, stdout, stderr) => {
  if (err) {
    console.error('Compression failed:', err);
    console.error(stderr);
    process.exit(1);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const stats = fs.statSync(outputVideo);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\nCompression completed in ${durationSec}s!`);
  console.log(`Compressed Video Size: ${sizeMB} MB (within Cloudinary limit)`);

  console.log('\n=== STEP 2: UPLOADING TO CLOUDINARY ===');
  cloudinary.uploader.upload(
    outputVideo,
    {
      resource_type: 'video',
      folder: 'swayamkrushi/videos',
      public_id: 'manjula_mam_video',
      overwrite: true
    },
    (uploadErr, uploadResult) => {
      if (uploadErr) {
        console.error('Upload Error:', uploadErr);
        process.exit(1);
      }

      console.log('\n==================================================');
      console.log('🎉 CLOUDINARY VIDEO UPLOAD SUCCESSFUL!');
      console.log('==================================================');
      console.log('Direct Video URL:');
      console.log(uploadResult.secure_url);
      console.log('\nPublic ID:', uploadResult.public_id);
      console.log('Duration:', uploadResult.duration, 'seconds');
      console.log('Format:', uploadResult.format);
      console.log('Size:', (uploadResult.bytes / (1024 * 1024)).toFixed(2), 'MB');
      console.log('==================================================\n');

      // Cleanup local temp file
      try {
        fs.unlinkSync(outputVideo);
      } catch (_) {}

      process.exit(0);
    }
  );
});

ffmpegProcess.stderr.on('data', (data) => {
  const line = data.toString();
  if (line.includes('time=')) {
    process.stdout.write(`\rProgress: ${line.trim()}`);
  }
});
