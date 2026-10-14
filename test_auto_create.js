const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ffprobe = require('@ffprobe-installer/ffprobe');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptText = "Stop using your current class in Warzone right now. This broken SMG melts in 420 milliseconds with zero recoil. Save this video before your next match!";
const voiceWavPath = path.join(__dirname, 'sample', 'auto_voice.wav');

console.log('1. Generating AI Voiceover...');
const psScript = path.join(__dirname, 'generate_voice.ps1');
const ttsRes = spawnSync('powershell', [
  '-ExecutionPolicy', 'Bypass',
  '-File', psScript,
  '-text', scriptText,
  '-output', voiceWavPath
]);

if (ttsRes.status !== 0) {
  console.error('TTS error:', ttsRes.stderr.toString());
  process.exit(1);
}

// 2. Measure duration
const probeRes = spawnSync(ffprobe.path, [
  '-v', 'error',
  '-show_entries', 'format=duration',
  '-of', 'json',
  voiceWavPath
]);
const duration = parseFloat(JSON.parse(probeRes.stdout.toString()).format.duration);
console.log('Voice duration:', duration, 'seconds');

// 3. Generate ASS subtitles
function formatAssTime(sec) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);
  const centis = Math.floor((sec % 1) * 100);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

const words = scriptText.toUpperCase().split(/\s+/);
const phrases = [];
for (let i = 0; i < words.length; i += 3) {
  phrases.push(words.slice(i, i + 3).join(' '));
}

const phraseDur = duration / phrases.length;
let events = '';
phrases.forEach((phrase, idx) => {
  const start = formatAssTime(idx * phraseDur);
  const end = formatAssTime(Math.min((idx + 1) * phraseDur, duration));
  events += `Dialogue: 0,${start},${end},CODGold,,0,0,0,,${phrase}\n`;
});

const assContent = `[Script Info]
Title: TikTok Auto Short
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: CODGold,Impact,78,&H0000A5FF,&H0000A5FF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,10,5,2,40,40,920,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}
`;

const assPath = path.join(__dirname, 'output', 'auto_sub.ass');
fs.writeFileSync(assPath, assContent, 'utf-8');

// 4. Render complete vertical video
const outputPath = path.join(__dirname, 'output', 'auto_video.mp4');

// Video background: Dark gaming grid with subtle pulsing crosshair and red target box
const bgFilter = `[1:v]drawgrid=w=120:h=120:t=2:c=red@0.15,` +
                 `drawbox=x=440:y=860:w=200:h=200:c=0x00A5FF@0.4:t=3,` +
                 `drawbox=x=539:y=800:w=2:h=320:c=0x00A5FF@0.6:t=fill,` +
                 `drawbox=x=380:y=959:w=320:h=2:c=0x00A5FF@0.6:t=fill,` +
                 `subtitles=output/auto_sub.ass[vout]`;

// Background beat audio mixed with voice:
const audioFilter = `aevalsrc=sin(2*PI*55*t)*exp(-4*mod(t\\,0.5)):s=44100:d=${duration}[beat];` +
                    `[0:a]volume=1.0[voice];[beat]volume=0.18[music];[voice][music]amix=inputs=2:duration=first[aout]`;

const ffmpegArgs = [
  '-y',
  '-i', voiceWavPath,
  '-f', 'lavfi', '-i', `color=c=0x0b0c10:s=1080x1920:d=${duration}`,
  '-filter_complex', `${bgFilter};${audioFilter}`,
  '-map', '[vout]',
  '-map', '[aout]',
  '-c:v', 'libx264',
  '-preset', 'veryfast',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '128k',
  outputPath
];

console.log('4. Rendering final vertical 1080x1920 video with voiceover & subtitles...');
const renderRes = spawnSync(ffmpeg.path, ffmpegArgs, { cwd: __dirname });

if (renderRes.status === 0 && fs.existsSync(outputPath)) {
  console.log('SUCCESS! Video auto-generated! Size:', fs.statSync(outputPath).size, 'bytes');
} else {
  console.error('Render error:', renderRes.stderr.toString());
}
