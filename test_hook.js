const cp = require('child_process');
const p = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');

const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: HookCard,Arial,52,&H00000000,&H00000000,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,5,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:05.00,HookCard,,0,0,0,,{\\an5\\pos(550,175)}“This SUPERI 46 Class Is\\nStraight-Up Illegal 💀🔥”
`;

fs.writeFileSync('sample/test_hook.ass', assContent);

// White box at x=150, y=80, w=780, h=190 + Red bracket on left
const filter = '[0:v]scale=1080:1920,' +
  'drawbox=x=150:y=80:w=780:h=190:c=white:t=fill,' +
  'drawbox=x=120:y=65:w=16:h=220:c=red:t=fill,' +
  'drawbox=x=120:y=65:w=120:h=16:c=red:t=fill,' +
  'drawbox=x=120:y=269:w=120:h=16:c=red:t=fill,' +
  'subtitles=sample/test_hook.ass[vout]';

const res = cp.spawnSync(p, [
  '-y',
  '-ss', '4',
  '-i', 'uploads/upload_1791993791760-797965718.mp4',
  '-filter_complex', filter,
  '-map', '[vout]',
  '-vframes', '1',
  'sample/test_hook_out.jpg'
]);

console.log('Hook card code:', res.status);
if (fs.existsSync('sample/test_hook.ass')) fs.unlinkSync('sample/test_hook.ass');
