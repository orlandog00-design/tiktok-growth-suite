const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const assContent = `[Script Info]
Title: TikTok Style Subtitles
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: HormoziYellow,Arial,72,&H0000FFFF,&H0000FFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,8,4,2,40,40,350,1
Style: BeastWhite,Arial,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,8,4,2,40,40,350,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:02.50,HormoziYellow,,0,0,0,,STOP SCROLLING RIGHT NOW!
Dialogue: 0,0:00:02.50,0:00:05.00,BeastWhite,,0,0,0,,THIS HACK WILL CHANGE EVERYTHING
Dialogue: 0,0:00:05.00,0:00:08.00,HormoziYellow,,0,0,0,,WATCH UNTIL THE VERY END
`;

const assPath = path.join(__dirname, 'sample', 'test.ass');
fs.writeFileSync(assPath, assContent, 'utf-8');

const inputPath = path.join(__dirname, 'sample', 'demo_clip.mp4');
const outputPath = path.join(__dirname, 'sample', 'test_out.mp4');

// Crop 1280x720 to vertical 1080x1920 with blurred background pad:
// split [v1][v2]; [v1] scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5 [bg]; [v2] scale=1080:-1 [fg]; [bg][fg] overlay=(W-w)/2:(H-h)/2,subtitles=sample/test.ass [out]

const filterGraph = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg];[0:v]scale=1080:-1[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,subtitles=sample/test.ass[out]`;

console.log('Running render test...');
const args = [
  '-y',
  '-i', inputPath,
  '-filter_complex', filterGraph,
  '-map', '[out]',
  '-map', '0:a?',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-t', '6',
  outputPath
];

const res = spawnSync(ffmpeg.path, args, { cwd: __dirname });
if (res.error) {
  console.error('Spawn error:', res.error);
} else {
  console.log('Exit code:', res.status);
  if (res.status === 0) {
    console.log('Success! Output file size:', fs.statSync(outputPath).size, 'bytes');
  } else {
    console.error('FFmpeg stderr:', res.stderr.toString());
  }
}
