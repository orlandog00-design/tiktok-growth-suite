const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputPath = path.join(__dirname, 'sample', 'demo_clip.mp4');

console.log('Generating demo video via FFmpeg at:', outputPath);

const args = [
  '-y',
  '-f', 'lavfi',
  '-i', 'testsrc=duration=15:size=1280x720:rate=30',
  '-f', 'lavfi',
  '-i', 'sine=frequency=440:duration=15',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '128k',
  outputPath
];

const res = spawnSync(ffmpeg.path, args);
if (res.error) {
  console.error('Error creating demo video:', res.error);
} else {
  console.log('Demo video created successfully! Size:', fs.statSync(outputPath).size, 'bytes');
}
