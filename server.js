const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawn, spawnSync } = require('child_process');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

function getFfmpegPath() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  if (fs.existsSync('/usr/bin/ffmpeg')) {
    return '/usr/bin/ffmpeg';
  }
  return ffmpegInstaller.path;
}

function getFfprobePath() {
  if (process.env.FFPROBE_PATH && fs.existsSync(process.env.FFPROBE_PATH)) {
    return process.env.FFPROBE_PATH;
  }
  if (fs.existsSync('/usr/bin/ffprobe')) {
    return '/usr/bin/ffprobe';
  }
  return ffprobeInstaller.path;
}

function getYtDlpPath() {
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    return process.env.YTDLP_PATH;
  }
  if (fs.existsSync('/usr/local/bin/yt-dlp')) {
    return '/usr/local/bin/yt-dlp';
  }
  if (fs.existsSync('/usr/bin/yt-dlp')) {
    return '/usr/bin/yt-dlp';
  }
  const localExe = path.join(__dirname, 'yt-dlp.exe');
  if (fs.existsSync(localExe)) {
    return localExe;
  }
  return 'yt-dlp';
}

async function generateVoiceoverAudio(text, outputPath, voice = 'christopher') {
  const voiceMap = {
    'christopher': 'en-US-ChristopherNeural',
    'guy': 'en-US-GuyNeural',
    'jenny': 'en-US-JennyNeural',
    'ryan': 'en-GB-RyanNeural',
    'aria': 'en-US-AriaNeural'
  };
  const edgeVoice = voiceMap[voice] || 'en-US-ChristopherNeural';

  // Option 1: Edge TTS (ultra-clean neural voices) if available
  try {
    const res = spawnSync('edge-tts', [
      '--voice', edgeVoice,
      '--text', text,
      '--write-media', outputPath
    ]);
    if (res.status === 0 && fs.existsSync(outputPath)) {
      return;
    }
  } catch (e) {}

  // Option 2: Windows PowerShell fallback
  if (process.platform === 'win32') {
    const psScript = path.join(__dirname, 'generate_voice.ps1');
    const gender = (voice === 'jenny' || voice === 'aria') ? 'Female' : 'Male';
    const res = spawnSync('powershell', [
      '-ExecutionPolicy', 'Bypass',
      '-File', psScript,
      '-text', text,
      '-output', outputPath,
      '-gender', gender
    ]);
    if (res.status === 0 && fs.existsSync(outputPath)) {
      return;
    }
    console.error('PowerShell TTS failed:', res.stderr?.toString());
    throw new Error('PowerShell Voiceover generation failed');
  }

  // Option 3: Fallback silent audio with ffmpeg if no TTS engine is present
  const ffmpeg = getFfmpegPath();
  spawnSync(ffmpeg, [
    '-y',
    '-f', 'lavfi',
    '-i', 'anullsrc=r=44100:cl=stereo',
    '-t', '5',
    '-c:a', 'pcm_s16le',
    outputPath
  ]);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/output', express.static(path.join(__dirname, 'output')));
app.use('/sample', express.static(path.join(__dirname, 'sample')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/tracks', express.static(path.join(__dirname, 'tracks')));

// Storage for uploaded videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `upload_${unique}${ext}`);
  }
});
const upload = multer({ storage });

// ==========================================
// 1. TREND RADAR DATABASE
// ==========================================
const TRENDS_DATA = [
  {
    id: 'trend-cod-1',
    category: 'gaming',
    title: 'The Broken Zero-Recoil SMG Meta That Melts in 420ms',
    velocity: '🔥 5.4M Views/Day',
    velocityType: 'viral',
    growth: '+620% this week',
    hookPattern: 'Secret Broken Class / No Recoil',
    recommendedAudio: 'Brazilian Phonk (140 BPM) / Fast Drift',
    soundMood: 'Hyper-Aggressive & Hype',
    hashtags: ['#warzone', '#warzoneloadout', '#codwarzone', '#warzoneclips', '#rebirthisland'],
    promptIdea: 'The broken zero-recoil SMG class in Warzone with secret attachment tuning that beats every meta.'
  },
  {
    id: 'trend-cod-2',
    category: 'gaming',
    title: 'Pro Movement Secret That Breaks Cameras in Rebirth Island',
    velocity: '🚀 4.1M Views/Day',
    velocityType: 'breakout',
    growth: '+380% this week',
    hookPattern: 'Camera Breaker / Pro Movement',
    recommendedAudio: 'Aggressive Cyber Trap / Bass Drop',
    soundMood: 'Sweaty & High Octane',
    hashtags: ['#warzonemovement', '#warzone', '#codmovement', '#rebirthclips', '#callofduty'],
    promptIdea: 'The snaking and camera-breaking movement trick that top Warzone pros use to win 1v4s.'
  },
  {
    id: 'trend-cod-3',
    category: 'gaming',
    title: 'Turn OFF This Default Controller Setting for Instant Aimbot',
    velocity: '⚡ 4.8M Views/Day',
    velocityType: 'viral',
    growth: '+450% this week',
    hookPattern: 'Hidden Setting / Rotational Aim Assist',
    recommendedAudio: 'Dark Synthwave / Fast Electronic',
    soundMood: 'Technical & Game-Changing',
    hashtags: ['#warzonesettings', '#aimassist', '#controllerplayer', '#codsettings', '#warzonetips'],
    promptIdea: 'The hidden deadzone and aim assist curve setting that makes rotational tracking effortless.'
  },
  {
    id: 'trend-cod-4',
    category: 'gaming',
    title: 'How I 1v4 Wiped a Full Squad of Iris (Tactical Breakdown)',
    velocity: '🔥 3.9M Views/Day',
    velocityType: 'breakout',
    growth: '+290% this week',
    hookPattern: 'Live Clutch Breakdown / IQ Play',
    recommendedAudio: 'Suspense Drone into Heavy Phonk Drop',
    soundMood: 'Clutch & Suspenseful',
    hashtags: ['#warzoneclutch', '#warzoneplays', '#warzoneclips', '#rebirthclutch', '#gamertok'],
    promptIdea: 'Step-by-step tactical breakdown of a 1v4 squad wipe on Rebirth Island showing high IQ positioning.'
  },
  {
    id: 'trend-cod-5',
    category: 'gaming',
    title: 'The Funniest Hot Mic Death Comms That Made Him Rage Quit',
    velocity: '🔥 6.2M Views/Day',
    velocityType: 'viral',
    growth: '+580% this week',
    hookPattern: 'Rage Death Comms / Funny Reactions',
    recommendedAudio: 'Upbeat Meme Bass / Record Scratch',
    soundMood: 'Hilarious & Chaotic',
    hashtags: ['#deathcomms', '#warzonefunny', '#codrage', '#warzonememes', '#funnymoments'],
    promptIdea: 'Hilarious compilation of hot mic death comms after executing sweats and campers.'
  },
  {
    id: 'trend-cod-6',
    category: 'gaming',
    title: 'The Secret High-Ground Spot in Rebirth Nobody Checks',
    velocity: '🚀 3.2M Views/Day',
    velocityType: 'breakout',
    growth: '+310% this week',
    hookPattern: 'Hidden Map Spot / Free Team Wipes',
    recommendedAudio: 'Mystery Synth into Phonk Drop',
    soundMood: 'Sneaky & Rewarding',
    hashtags: ['#rebirthisland', '#warzonehacks', '#warzoneglitch', '#codtips', '#warzonelocations'],
    promptIdea: 'Show a little-known parkour jump spot on Rebirth Island that gives unfair line-of-sight for squad wipes.'
  },
  {
    id: 'trend-1',
    category: 'tech',
    title: 'The AI Websites That Feel Illegal to Know',
    velocity: '🔥 3.8M Views/Day',
    velocityType: 'viral',
    growth: '+420% this week',
    hookPattern: 'Contrarian / Hidden Secrets',
    recommendedAudio: 'Phonk Velocity (138 BPM) / Dark Synth',
    soundMood: 'Energetic & Secretive',
    hashtags: ['#aitools', '#techhacks', '#productivity', '#futuretech', '#websites'],
    promptIdea: 'Review 3 mind-blowing AI websites that automate complex tasks for free.'
  },
  {
    id: 'trend-2',
    category: 'finance',
    title: 'Stop Saving Money in a Traditional Bank Account',
    velocity: '🚀 2.1M Views/Day',
    velocityType: 'breakout',
    growth: '+280% this week',
    hookPattern: 'Stop Doing This (Negative Framing)',
    recommendedAudio: 'Suspense Drone into Upbeat Trap Drop',
    soundMood: 'Authoritative & Urgent',
    hashtags: ['#moneytok', '#wealthtips', '#personalfinance', '#investing101', '#financialfreedom'],
    promptIdea: 'Explain why inflation quietly eats away standard savings accounts and reveal 2 high-yield alternatives.'
  },
  {
    id: 'trend-3',
    category: 'fitness',
    title: 'The 1 Habit Destroying Your Sleep & Metabolism',
    velocity: '⚡ 1.9M Views/Day',
    velocityType: 'hot',
    growth: '+190% this week',
    hookPattern: 'Mistake You Are Making',
    recommendedAudio: 'Lo-Fi Chill Focus / Binaural Beats',
    soundMood: 'Calm, Scientific & Actionable',
    hashtags: ['#fitnesstips', '#sleephacks', '#healthtok', '#biohacking', '#metabolism'],
    promptIdea: 'Reveal the single nighttime mistake people make that ruins morning energy and fat loss.'
  },
  {
    id: 'trend-4',
    category: 'ecommerce',
    title: 'I Tested This Viral TikTok Shop Gadget So You Do not Have To',
    velocity: '🔥 4.2M Views/Day',
    velocityType: 'viral',
    growth: '+510% this week',
    hookPattern: 'Product Testing & Brutal Honesty',
    recommendedAudio: 'Upbeat Pop Funk / Fast Acoustic',
    soundMood: 'Curious & Transparent',
    hashtags: ['#tiktokmademebuyit', '#productreview', '#amazongadgets', '#unboxing', '#honestreview'],
    promptIdea: 'Honest review of an everyday problem-solving gadget, highlighting pros, cons, and verdict.'
  },
  {
    id: 'trend-5',
    category: 'storytelling',
    title: 'The Unsolved Case That Investigators Tried to Erase',
    velocity: '🚀 3.4M Views/Day',
    velocityType: 'breakout',
    growth: '+350% this week',
    hookPattern: 'Dark Mystery / Open Loop',
    recommendedAudio: 'Horror Drone / Creepy Piano Ambience',
    soundMood: 'Chilling & Suspenseful',
    hashtags: ['#mysterytok', '#truecrimetok', '#creepyfacts', '#storytime', '#unsolved'],
    promptIdea: 'Tell a 60-second chilling mystery with an unexpected twist in the final 5 seconds.'
  },
  {
    id: 'trend-6',
    category: 'psychology',
    title: 'Dark Psychology Tricks People Use to Manipulate You Daily',
    velocity: '⚡ 2.6M Views/Day',
    velocityType: 'hot',
    growth: '+215% this week',
    hookPattern: 'Protective Knowledge / Self Defense',
    recommendedAudio: 'Ticking Clock into Heavy Sub-Bass',
    soundMood: 'Psychological & Intriguing',
    hashtags: ['#psychologyfacts', '#mindset', '#manipulation', '#bodylanguage', '#humanbehavior'],
    promptIdea: 'Reveal 2 subtle psychological techniques people use in conversations and how to spot them instantly.'
  }
];

// REAL-TIME NEWS & RSS HEADLINE FETCHER
async function fetchLiveNewsHeadlines(query = 'Warzone Call of Duty meta') {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6);
    const headlines = [];
    for (const item of items) {
      const tm = item[1].match(/<title>([\s\S]*?)<\/title>/);
      if (tm && tm[1]) {
        let clean = tm[1].replace(/ - [^-]+$/, '').trim();
        clean = clean.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        if (clean.length > 15 && !clean.toLowerCase().includes('google news')) {
          headlines.push(clean);
        }
      }
    }
    return headlines;
  } catch (err) {
    return [];
  }
}

// DYNAMIC LIVE TREND GENERATOR (REAL-TIME FLUCTUATION, LIVE NEWS & AUDIOS)
function generateLiveDynamicTrends(category = 'all', liveHeadlines = []) {
  const gamingTemplates = [
    {
      title: "The Silent Buff to the Jackal PDW That Beats Every SMG",
      growth: "+780% this week",
      hook: "Silent Nerf & Secret Buff",
      audio: "Brazilian Phonk (136 BPM) / Fast Drift",
      audioId: "phonk_drift",
      tiktokAudioQuery: "Brazilian Phonk Fast Drift Kordhell",
      hashtags: ["#warzone", "#warzoneloadout", "#jackalpdw", "#rebirthisland", "#bo6"],
      prompt: "The silent buff to the Jackal PDW that beats every SMG in Warzone Season 1."
    },
    {
      title: "Pro Movement Trick: Omnimovement Slide-Cancel Camera Breaker",
      growth: "+620% this week",
      hook: "Camera Breaker / Pro Setting",
      audio: "Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)",
      audioId: "dark_808_drill",
      tiktokAudioQuery: "Dark 808 Drill Warzone Montage",
      hashtags: ["#warzonemovement", "#omnimovement", "#codwarzone", "#rebirthisland", "#gamingtips"],
      prompt: "How to break cameras with omnimovement in Rebirth Island."
    },
    {
      title: "The Zero-Recoil Model L Setup Dominating Long Range",
      growth: "+540% this week",
      hook: "Laser Beam / Zero Recoil",
      audio: "Montage Distortion Guitar (142 BPM - Sniper Headshots)",
      audioId: "guitar_montage",
      tiktokAudioQuery: "Distortion Guitar Rock Phonk",
      hashtags: ["#modell", "#warzonemeta", "#codloadout", "#longrange", "#warzoneclips"],
      prompt: "The zero-recoil Model L assault rifle class that beams cross-map."
    },
    {
      title: "This 1v4 Clutch Audio Cue Tells You Exactly Where They Are",
      growth: "+490% this week",
      hook: "Secret Audio Setting",
      audio: "Sigma 808 Cinematic Drop (128 BPM - 1v4 Clutch)",
      audioId: "sigma_drop",
      tiktokAudioQuery: "Sigma 808 Cinematic Bass Drop",
      hashtags: ["#warzoneaudiosettings", "#1v4clutch", "#codtactics", "#rebirth"],
      prompt: "The secret audio EQ setting in Warzone that makes enemy footsteps 10x louder."
    },
    {
      title: "The 1-Shot LR 7.62 Sniper Class That Wipes Squads in 3 Seconds",
      growth: "+830% this week",
      hook: "One-Shot Bullet Velocity",
      audio: "Hyper-Drive Hardstyle (150 BPM - Camera Breaker)",
      audioId: "hyper_hardstyle",
      tiktokAudioQuery: "Hardstyle Tevvez Kick Adrenaline",
      hashtags: ["#lr762", "#sniper", "#warzoneclips", "#oneshotsniper", "#quickscope"],
      prompt: "The fastest ADS 1-shot sniper loadout in Warzone."
    },
    {
      title: "The Secret Hipfire C9 Build That Wins Every Close-Range Fight",
      growth: "+410% this week",
      hook: "Never ADS / Hipfire Spray",
      audio: "Slowed + Reverb Phonk (115 BPM - Aesthetic Vibe)",
      audioId: "slowed_reverb_phonk",
      tiktokAudioQuery: "Slowed Reverb Phonk Drift",
      hashtags: ["#c9smg", "#hipfirebuild", "#warzonemeta", "#codclips"],
      prompt: "The broken hipfire C9 build in Warzone where you never have to aim down sights."
    },
    {
      title: "The Broken Krig C Class With Zero Damage Dropoff Cross-Map",
      growth: "+670% this week",
      hook: "Hidden Velocity Barrel",
      audio: "Cyber Combat Rush (148 BPM - Fast Adrenaline)",
      audioId: "cyber_rush",
      tiktokAudioQuery: "Cyber Rush Fast Electronic Bass",
      hashtags: ["#krigc", "#warzonemeta", "#blackops6", "#codclips"],
      prompt: "The secret Krig C attachments that remove damage dropoff across Rebirth Island."
    }
  ];

  const facelessTemplates = [
    {
      category: "mystery",
      title: "The Unsolved 1974 Broadcast Hijacking Nobody Can Explain",
      growth: "+690% this week",
      hook: "Unexplained Historical Mystery",
      audio: "Suspense Countdown & Drop (130 BPM - Secret Class Reveal)",
      audioId: "suspense_drop",
      tiktokAudioQuery: "Horror Drone Suspense Ticking Clock",
      hashtags: ["#creepy", "#unsolvedmysteries", "#darkhistory", "#scaryfacts"],
      prompt: "Explain the chilling unsolved 1974 television broadcast hijacking in 45 seconds."
    },
    {
      category: "storytelling",
      title: "A Reddit Confession That Exposed a $4M Scam In 24 Hours",
      growth: "+510% this week",
      hook: "Viral Drama & Revenge",
      audio: "Bouncy 808 Trap (132 BPM - Meta Recoil & Commentary)",
      audioId: "bouncy_trap",
      tiktokAudioQuery: "Bouncy 808 Trap Beat Storytime",
      hashtags: ["#redditstories", "#confessions", "#storytime", "#drama"],
      prompt: "A gripping retelling of an anonymous Reddit confession that exposed a massive corporate secret."
    },
    {
      category: "tech",
      title: "3 AI Websites That Feel Completely Illegal to Know in 2026",
      growth: "+720% this week",
      hook: "Gatekept Tools / Secret Shortcut",
      audio: "Cyber Combat Rush (148 BPM - Fast Adrenaline)",
      audioId: "cyber_rush",
      tiktokAudioQuery: "Future Synth Electronic Cyber",
      hashtags: ["#aiwebsites", "#productivity", "#aitools", "#techhacks"],
      prompt: "Reveal 3 free AI web apps that automate everyday digital tasks in seconds."
    },
    {
      category: "psychology",
      title: "3 Psychological Signs Someone Is Secretly Jealous of You",
      growth: "+450% this week",
      hook: "Social Defense & Human Behavior",
      audio: "Chill Lofi Gunsmith (90 BPM - Attachment Breakdown)",
      audioId: "lofi_gunsmith",
      tiktokAudioQuery: "Chill Lofi Hip Hop Beats",
      hashtags: ["#darkpsychology", "#bodylanguage", "#humanbehavior", "#mindset"],
      prompt: "Breakdown 3 subtle micro-expressions that reveal hidden jealousy in social interactions."
    },
    {
      category: "finance",
      title: "Why Traditional Savings Accounts Quietly Steal 7% of Your Cash",
      growth: "+380% this week",
      hook: "Stop Doing This / Money Leak",
      audio: "Bouncy 808 Trap (132 BPM - Meta Recoil & Commentary)",
      audioId: "bouncy_trap",
      tiktokAudioQuery: "Money Wealth 808 Trap Beat",
      hashtags: ["#moneytok", "#financehacks", "#inflation", "#wealthsecrets"],
      prompt: "Explain the mathematical flaw of keeping liquid cash in 0.01% savings accounts and offer 2 smart alternatives."
    }
  ];

  // Convert live RSS headlines into viral trend cards if available
  const dynamicLiveCards = [];
  if (Array.isArray(liveHeadlines) && liveHeadlines.length > 0) {
    liveHeadlines.slice(0, 3).forEach((hl, i) => {
      const audioOptions = [
        { name: "Brazilian Phonk (136 BPM) / Fast Drift", id: "phonk_drift", query: "Brazilian Phonk Fast Drift" },
        { name: "Dark 808 Drill (140 BPM - Heavy Sub-Bass)", id: "dark_808_drill", query: "Dark 808 Drill Montage" },
        { name: "Sigma 808 Cinematic Drop (128 BPM)", id: "sigma_drop", query: "Sigma 808 Drop" }
      ];
      const audio = audioOptions[i % audioOptions.length];
      dynamicLiveCards.push({
        id: `rss-live-${Date.now()}-${i}`,
        category: category === 'all' ? 'gaming' : category,
        title: `BREAKING: ${hl.length > 60 ? hl.slice(0, 58) + '...' : hl}`,
        velocity: `🔥 ${(Math.random() * 3 + 5.5).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: `+${Math.floor(Math.random() * 300 + 550)}% this week`,
        freshness: `🔴 LIVE NOW • ${Math.floor(Math.random() * 6 + 2)}m ago`,
        hookPattern: "Breaking Meta / Real-Time Patch",
        recommendedAudio: audio.name,
        audioId: audio.id,
        tiktokAudioQuery: audio.query,
        hashtags: ["#warzonenews", "#codupdate", "#warzonemeta", "#breakout"],
        promptIdea: `Cover this breaking news story for TikTok: "${hl}". Hook the viewer in the first 2 seconds.`
      });
    });
  }

  let pool = [];
  if (category === 'gaming') {
    pool = [...dynamicLiveCards, ...gamingTemplates];
  } else if (category === 'mystery' || category === 'storytelling') {
    pool = [...facelessTemplates.filter(t => t.category === 'mystery' || t.category === 'storytelling')];
  } else if (category === 'tech') {
    pool = [...facelessTemplates.filter(t => t.category === 'tech')];
  } else if (category === 'psychology') {
    pool = [...facelessTemplates.filter(t => t.category === 'psychology')];
  } else if (category === 'finance') {
    pool = [...facelessTemplates.filter(t => t.category === 'finance')];
  } else {
    pool = [...dynamicLiveCards, ...gamingTemplates, ...facelessTemplates];
  }

  return pool.sort(() => Math.random() - 0.5).map((t, idx) => {
    if (t.id && t.id.startsWith('rss-live')) return t; // Already processed
    const views = (Math.random() * 5 + 3.4).toFixed(1);
    const types = ['viral', 'breakout', 'hot'];
    const minsAgo = Math.floor(Math.random() * 35 + 3);
    return {
      id: `live-trend-${Date.now()}-${idx}`,
      category: t.category || 'gaming',
      title: t.title,
      velocity: `🔥 ${views}M Views/Day`,
      velocityType: types[idx % types.length],
      growth: t.growth,
      freshness: minsAgo < 10 ? `🔴 LIVE • ${minsAgo}m ago` : `⚡ SURGING • ${minsAgo}m ago`,
      hookPattern: t.hook,
      recommendedAudio: t.audio,
      audioId: t.audioId,
      tiktokAudioQuery: t.tiktokAudioQuery || t.audio,
      hashtags: t.hashtags,
      promptIdea: t.prompt
    };
  });
}

app.get('/api/trends', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    let query = 'Warzone Call of Duty meta';
    if (category === 'tech') query = 'AI websites tools artificial intelligence';
    if (category === 'mystery') query = 'unsolved mystery spooky historical';
    if (category === 'finance') query = 'personal finance money wealth inflation';

    const liveHeadlines = await fetchLiveNewsHeadlines(query);
    const freshTrends = generateLiveDynamicTrends(category, liveHeadlines);
    res.json(freshTrends);
  } catch (err) {
    res.json(generateLiveDynamicTrends(req.query.category || 'all'));
  }
});

app.post('/api/trends/refresh', async (req, res) => {
  try {
    const { category = 'all', apiKey, model = 'gemini-1.5-flash' } = req.body;

    let query = 'Warzone Call of Duty meta patch';
    if (category === 'tech') query = 'AI websites tools tech hack';
    if (category === 'mystery') query = 'unsolved mystery broadcast chilling';
    if (category === 'finance') query = 'money personal finance wealth hack';
    const liveHeadlines = await fetchLiveNewsHeadlines(query);

    if (apiKey && apiKey.trim().length > 10) {
      try {
        console.log(`Refreshing live trends via Gemini (${model}) for category: ${category}`);
        const headlineContext = liveHeadlines.length > 0 
          ? `Current real-time breaking headlines today: \n${liveHeadlines.map(h => `- ${h}`).join('\n')}` 
          : '';

        const systemPrompt = `You are an elite viral trend intelligence system monitoring TikTok, YouTube Shorts, and Call of Duty Warzone / Black Ops 6 algorithms.
Generate 6 REAL-TIME, high-velocity breakout viral trends right now for category: "${category}".
${headlineContext}
Ensure every trend has:
- Hyper-specific topic title (e.g. "The Broken Zero-Recoil Jackal PDW Setup in Rebirth", "Dark Psychology Secrets of FBI Interrogators", "The 140 BPM Drift Phonk Meta That Quadrupled Watch Time").
- Real viral velocity (e.g. "🔥 6.8M Views/Day" or "🚀 4.5M Views/Day").
- velocityType: "viral", "breakout", or "hot".
- growth: (e.g. "+520% this week").
- freshness: (e.g. "🔴 LIVE • 3m ago" or "⚡ SURGING • 12m ago").
- hookPattern: exact hook framework (e.g. "Secret Buff / Silent Nerf", "Contradiction / Pattern Interrupt").
- recommendedAudio: specific audio title, BPM, and sound mood.
- audioId: one of ["phonk_drift", "dark_808_drill", "guitar_montage", "sigma_drop", "hyper_hardstyle", "slowed_reverb_phonk", "cyber_rush", "suspense_drop", "bouncy_trap", "lofi_gunsmith"].
- tiktokAudioQuery: search term to find this sound on TikTok.
- hashtags: 4-6 hashtags.
- promptIdea: 1-sentence prompt.

Output MUST strictly be a JSON object:
{
  "trends": [
    {
      "id": "gemini-trend-1",
      "category": "${category}",
      "title": "...",
      "velocity": "🔥 7.2M Views/Day",
      "velocityType": "viral",
      "growth": "+640% this week",
      "freshness": "🔴 LIVE • 4m ago",
      "hookPattern": "...",
      "recommendedAudio": "Brazilian Phonk (136 BPM) / Fast Drift",
      "audioId": "phonk_drift",
      "tiktokAudioQuery": "Brazilian Phonk Fast Drift",
      "hashtags": ["#warzone", "#rebirthisland", "#codwarzone"],
      "promptIdea": "..."
    }
  ]
}`;
        const userPrompt = `Scan and return the 6 most viral, high-velocity trends and viral audio styles right now.`;
        const geminiResult = await callGeminiApi({ apiKey: apiKey.trim(), model, systemPrompt, userPrompt });
        if (geminiResult && geminiResult.trends && Array.isArray(geminiResult.trends)) {
          return res.json({ source: 'gemini', trends: geminiResult.trends });
        }
      } catch (err) {
        console.error('Gemini trend refresh failed, using dynamic generator:', err.message);
      }
    }

    // Dynamic pool generator with live RSS headlines
    const freshTrends = generateLiveDynamicTrends(category, liveHeadlines);
    res.json({ source: liveHeadlines.length > 0 ? 'live-rss' : 'dynamic', trends: freshTrends });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 2. VIRAL SCRIPT & HOOK GENERATOR ENGINE (GEMINI PRO + NEURAL TEMPLATES)
// ==========================================
async function callGeminiApi({ apiKey, model = 'gemini-1.5-flash', systemPrompt, userPrompt }) {
  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini API.');
  return JSON.parse(text);
}

app.post('/api/gemini/verify-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || apiKey.trim().length < 10) {
      return res.status(400).json({ valid: false, error: 'Please enter a valid Gemini API key.' });
    }

    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;
    const testRes = await fetch(testUrl);
    if (testRes.ok) {
      const data = await testRes.json();
      const modelNames = (data.models || []).map(m => m.name.replace('models/', ''));
      return res.json({ valid: true, models: modelNames });
    } else {
      const errData = await testRes.json().catch(() => ({}));
      return res.status(401).json({ valid: false, error: errData.error?.message || 'Invalid Gemini API key.' });
    }
  } catch (e) {
    return res.status(500).json({ valid: false, error: e.message });
  }
});

app.post('/api/generate-script', async (req, res) => {
  try {
    const { topic, niche = 'general', tone = 'energetic', duration = '30', goal = 'comments', apiKey, model = 'gemini-1.5-flash' } = req.body;

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Please enter a topic or concept.' });
    }

    // Live Google Gemini Pro/Flash API call if visitor provided their own key:
    if (apiKey && apiKey.trim().length > 10) {
      try {
        console.log(`Generating script via Google Gemini (${model}) for topic: ${topic}`);
        const systemPrompt = `You are an elite viral TikTok and YouTube Shorts retention strategist. 
Your goal is to generate a high-performing 9:16 short-form video script that maximizes watch time, shares, and comments.
Output MUST strictly follow this JSON schema:
{
  "title": "Catchy headline for the video",
  "hooks": [
    {
      "type": "Hook archetype name (e.g. Pattern Interrupt, Contradiction, Secret Leak)",
      "visual": "[VISUAL: Description of fast-paced visual action or text hook on screen]",
      "spoken": "The exact spoken hook words (under 12 words, punchy)",
      "score": "99% Retention Score"
    }
  ],
  "segments": [
    {
      "timecode": "0:00 - 0:03",
      "spoken": "Spoken sentence",
      "visual": "[VISUAL: Fast-paced visual cue]"
    }
  ],
  "endingCTA": "Punchy call to action (e.g. Save this video before your next match or comment your thoughts)",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

        const userPrompt = `Create a viral ${duration}-second TikTok script on the topic: "${topic}".
Niche: ${niche}
Tone: ${tone}
Goal: ${goal}
Provide 3 distinct viral hook options to choose from, followed by 3-5 punchy video segments, a high-converting ending CTA, and 5-8 trending hashtags.`;

        const geminiResult = await callGeminiApi({ apiKey: apiKey.trim(), model, systemPrompt, userPrompt });
        return res.json({
          source: 'gemini',
          model,
          hooks: geminiResult.hooks || geminiResult.hookOptions || [],
          segments: geminiResult.segments || [],
          endingCTA: geminiResult.endingCTA || 'Save this video before your next match!',
          hashtags: geminiResult.hashtags || ['#viral', '#trending', '#fyp']
        });
      } catch (geminiErr) {
        console.error('Gemini API call failed:', geminiErr.message);
        return res.status(500).json({
          error: `Gemini API Error: ${geminiErr.message}. Check your key or quota in Settings.`
        });
      }
    }

    // Built-in neural generator if no API key is provided
    const result = generateViralScript({ topic, niche, tone, duration, goal });
    res.json({ source: 'builtin', ...result });
  } catch (err) {
    console.error('Error generating script:', err);
    res.status(500).json({ error: 'Failed to generate script.' });
  }
});

function generateViralScript({ topic, niche, tone, duration, goal }) {
  const isGaming = niche.toLowerCase().includes('warzone') || 
                   niche.toLowerCase().includes('gaming') || 
                   topic.toLowerCase().includes('warzone') || 
                   topic.toLowerCase().includes('cod') ||
                   topic.toLowerCase().includes('loadout') ||
                   topic.toLowerCase().includes('rebirth');

  // Proven viral hook frameworks (Tailored for Gaming or General)
  let hookOptions = [];

  if (isGaming) {
    hookOptions = [
      {
        type: 'The Broken Meta / Class Alert',
        visual: '[VISUAL: High-octane sniper flick or SMG squad wipe gameplay clip with glowing kill feed]',
        spoken: `Stop using your current class in Warzone right now—this ${topic} setup secretly has a 420ms TTK and zero recoil.`,
        score: '99% Retention Score'
      },
      {
        type: 'The Movement Camera-Breaker',
        visual: '[VISUAL: Insane slide-cancel and jump-shot clip breaking an enemy camera in slow-motion]',
        spoken: `If you keep losing your 50-50 gunfights in Rebirth Island, you need to start using this ${topic} movement trick immediately.`,
        score: '97% Retention Score'
      },
      {
        type: 'The Hidden Setting / Aimbot Secret',
        visual: '[VISUAL: In-game controller settings menu with a red circle pulsing around the hidden slider]',
        spoken: `Turn off this single default setting in Warzone right now—it is literally turning off your rotational aim assist.`,
        score: '96% Retention Score'
      },
      {
        type: 'The 1v4 Squad Wipe Breakdown',
        visual: '[VISUAL: 1v4 clutch situation with 4 red enemy pings on mini-map, heart rate monitor graphic]',
        spoken: `Watch how I completely baited and wiped this entire sweaty team using this simple ${topic} strategy.`,
        score: '95% Retention Score'
      }
    ];
  } else {
    hookOptions = [
      {
        type: 'The Contrarian / Stop Doing This',
        visual: '[Look directly at camera, hold hand up to lens or shake head urgently]',
        spoken: `Stop making this massive mistake with ${topic} before it's too late.`,
        score: '98% Retention Score'
      },
      {
        type: 'The Curiosity Gap',
        visual: '[Lean in close to camera with a whisper, pointing over your shoulder]',
        spoken: `Nobody in ${niche} will tell you this, but here is the exact secret behind ${topic}.`,
        score: '96% Retention Score'
      },
      {
        type: 'The "Feels Illegal" Revelation',
        visual: '[Quick snap of fingers with fast zoom in, showing on-screen text]',
        spoken: `This one insight about ${topic} feels completely illegal to know.`,
        score: '95% Retention Score'
      },
      {
        type: 'The Brutally Honest Truth',
        visual: '[Sigh or look slightly annoyed, tapping screen with finger]',
        spoken: `I'm going to be completely honest with you about ${topic}, even if people hate me for it.`,
        score: '94% Retention Score'
      }
    ];
  }

  // Comment-bait debate closers based on goal
  let endingCTA = '';
  if (isGaming) {
    if (goal === 'comments') {
      endingCTA = `What gun are you currently running in Warzone? Drop your class setup in the comments and I will test it out and rate it!`;
    } else if (goal === 'saves') {
      endingCTA = `Save this video right now before you jump into your next Rebirth match so you don't forget these attachments!`;
    } else {
      endingCTA = `Follow for daily broken Warzone loadouts, movement guides, and live squad wipe breakdowns!`;
    }
  } else {
    if (goal === 'comments') {
      endingCTA = `Be honest in the comments: do you agree with this, or am I totally crazy? Drop your take below.`;
    } else if (goal === 'saves') {
      endingCTA = `Save this video right now before it disappears from your FYP so you can come back to it.`;
    } else {
      endingCTA = `Follow for part two where I break down the exact next steps step-by-step.`;
    }
  }

  // Generate structured script segments
  let segments = [];
  if (isGaming) {
    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Armor crack crunch + Headshot dink]'
      },
      {
        time: '0:03 - 0:10',
        section: 'The Meta Breakdown',
        spoken: `The developers secretly buffed this in the latest patch, and while everyone is using the old meta, this setup deletes armor before they can even react.`,
        visual: '[VISUAL: Side-by-side TTK chart showing 420ms vs 650ms with animated green checkmark]',
        sfx: '[SFX: Whoosh / Gun reload click]'
      },
      {
        time: '0:10 - 0:20',
        section: 'Exact Attachments / Setup',
        spoken: `Here are the exact 5 attachments you need to copy right now: For muzzle and barrel, focus on velocity and horizontal recoil control. For stock and optic, maximize your sprint-to-fire speed.`,
        visual: '[VISUAL: Gunsmith screen showing all 5 attachment tuning sliders clearly]',
        sfx: '[SFX: Ding / Stat beep]'
      },
      {
        time: '0:20 - 0:26',
        section: 'Live In-Game Proof',
        spoken: `Look at this recoil pattern—there literally is none. You can beam players across the map on Rebirth with zero effort.`,
        visual: '[VISUAL: Spray transfer wiping 2 enemies at 40 meters without missing a bullet]',
        sfx: '[SFX: Multi-kill voiceover / Phonk drop]'
      },
      {
        time: '0:26 - 0:30',
        section: 'The Engagement Loop (CTA)',
        spoken: endingCTA,
        visual: '[VISUAL: Final squad wipe victory screen with animated comment prompt]',
        sfx: '[SFX: Bass drop / Victory theme]'
      }
    ];
  } else {
    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Whoosh / Bass drop]'
      },
      {
        time: '0:03 - 0:10',
        section: 'The Agitation',
        spoken: `Most people think ${topic} is complicated, but the reality is that 99% of creators are doing it completely backwards.`,
        visual: '[VISUAL: Quick cut to screen recording or b-roll with animated red X]',
        sfx: '[SFX: Record scratch]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The Core Insight',
        spoken: `Here is what actually works: Focus on the single highest-leverage lever instead of wasting hours on obsolete methods.`,
        visual: '[VISUAL: Text pop-up on screen: "STEP 1: THE LEVERAGE LEVER"]',
        sfx: '[SFX: Pop sound / Camera shutter]'
      },
      {
        time: '0:20 - 0:26',
        section: 'The Proof & Delivery',
        spoken: `When you apply this, your results double in half the time because you are aligning with how the algorithm actually thinks.`,
        visual: '[VISUAL: Zoom in on key graphic or facial expression showing confidence]',
        sfx: '[SFX: Chime / Ding]'
      },
      {
        time: '0:26 - 0:30',
        section: 'The Engagement Loop (CTA)',
        spoken: endingCTA,
        visual: '[VISUAL: Point down towards the comment button with an open hand gesture]',
        sfx: '[SFX: Subtle sub-bass swell]'
      }
    ];
  }

  // Full readable teleprompter text
  const fullText = segments.map(s => s.spoken).join(' ');
  const wordCount = fullText.split(/\s+/).length;
  const estimatedSeconds = Math.round(wordCount / 2.6); // ~150-160 WPM pace

  const seoKeywords = `${topic}, ${niche} tips, how to ${topic}, viral ${niche}, growth hacks`;
  const hashtags = [
    `#${niche.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
    `#${topic.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
    '#tiktokgrowth',
    '#foryoupage',
    '#viralhacks'
  ];

  return {
    topic,
    niche,
    tone,
    hooks: hookOptions,
    segments,
    fullText,
    wordCount,
    estimatedSeconds,
    endingCTA,
    seo: {
      caption: `The truth about ${topic} nobody talks about 👇 Watch until the end. ${hashtags.join(' ')}`,
      keywords: seoKeywords,
      hashtags
    }
  };
}

// ==========================================
// 3. VIDEO PROCESSING & 9:16 CLIPPER ENGINE
// ==========================================

// Upload custom video
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided.' });
  }

  const videoPath = req.file.path;
  const ffprobePath = getFfprobePath();

  // Query video duration, width, height using ffprobe
  const probeArgs = [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=width,height,duration',
    '-of', 'json',
    videoPath
  ];

  const probe = spawn(ffprobePath, probeArgs);
  let stdout = '';
  probe.stdout.on('data', data => { stdout += data; });
  probe.on('close', code => {
    try {
      const data = JSON.parse(stdout);
      const stream = data.streams && data.streams[0] ? data.streams[0] : {};
      const duration = parseFloat(data.format?.duration || stream.duration || 15);
      const width = stream.width || 1280;
      const height = stream.height || 720;

      res.json({
        success: true,
        filename: req.file.filename,
        videoUrl: `/uploads/${req.file.filename}`,
        videoPath: videoPath,
        duration: Math.round(duration * 10) / 10,
        width,
        height
      });
    } catch (e) {
      res.json({
        success: true,
        filename: req.file.filename,
        videoUrl: `/uploads/${req.file.filename}`,
        videoPath: videoPath,
        duration: 15,
        width: 1280,
        height: 720
      });
    }
  });
});

// Upload overlay image (weapon builds, attachments table, memes, watermarks)
app.post('/api/upload-overlay-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  const imagePath = req.file.path;
  const probeArgs = [
    '-v', 'error',
    '-show_entries', 'stream=width,height',
    '-of', 'json',
    imagePath
  ];

  const probe = spawn(getFfprobePath(), probeArgs);
  let stdout = '';
  probe.stdout.on('data', data => { stdout += data; });
  probe.on('close', () => {
    let width = 1920;
    let height = 1080;
    try {
      const data = JSON.parse(stdout);
      if (data.streams && data.streams[0]) {
        width = data.streams[0].width || 1920;
        height = data.streams[0].height || 1080;
      }
    } catch (e) {}

    res.json({
      success: true,
      filename: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
      imagePath: imagePath,
      width,
      height
    });
  });
});

// ==========================================
// VIRAL WARZONE AUDIO LIBRARY & CUSTOM UPLOAD
// ==========================================
const WARZONE_TRACKS = {
  phonk_drift: path.join(__dirname, 'tracks', 'phonk_drift.wav'),
  dark_808_drill: path.join(__dirname, 'tracks', 'dark_808_drill.wav'),
  guitar_montage: path.join(__dirname, 'tracks', 'guitar_montage.wav'),
  sigma_drop: path.join(__dirname, 'tracks', 'sigma_drop.wav'),
  hyper_hardstyle: path.join(__dirname, 'tracks', 'hyper_hardstyle.wav'),
  slowed_reverb_phonk: path.join(__dirname, 'tracks', 'slowed_reverb_phonk.wav'),
  cyber_rush: path.join(__dirname, 'tracks', 'cyber_rush.wav'),
  suspense_drop: path.join(__dirname, 'tracks', 'suspense_drop.wav'),
  bouncy_trap: path.join(__dirname, 'tracks', 'bouncy_trap.wav'),
  lofi_gunsmith: path.join(__dirname, 'tracks', 'lofi_gunsmith.wav')
};

// Get audio tracks list
app.get('/api/audio-tracks', (req, res) => {
  res.json({
    tracks: [
      { id: 'phonk_drift', name: '🔥 Brazilian Phonk Drift (136 BPM - Movement/Kills)', mood: 'Aggressive' },
      { id: 'dark_808_drill', name: '💀 Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)', mood: 'Dark' },
      { id: 'guitar_montage', name: '🎸 Montage Distortion Guitar (142 BPM - Sniper Headshots)', mood: 'Hype' },
      { id: 'sigma_drop', name: '🗿 Sigma 808 Cinematic Drop (128 BPM - 1v4 Clutch)', mood: 'Dramatic' },
      { id: 'hyper_hardstyle', name: '🚀 Hyper-Drive Hardstyle (150 BPM - Camera Breaker)', mood: 'Energetic' },
      { id: 'slowed_reverb_phonk', name: '🌌 Slowed + Reverb Phonk (115 BPM - Aesthetic Vibe)', mood: 'Chill/Vibe' },
      { id: 'cyber_rush', name: '⚡ Cyber Combat Rush (148 BPM - Fast Adrenaline)', mood: 'Sci-Fi' },
      { id: 'suspense_drop', name: '⏱️ Suspense Countdown & Drop (130 BPM - Secret Class Reveal)', mood: 'Mystery' },
      { id: 'bouncy_trap', name: '🎯 Bouncy 808 Trap (132 BPM - Meta Recoil & Commentary)', mood: 'Bouncy' },
      { id: 'lofi_gunsmith', name: '☕ Chill Lofi Gunsmith (90 BPM - Attachment Breakdown)', mood: 'Relaxed' },
      { id: 'none', name: '🔇 No Music (Voiceover / Clean SFX Only)', mood: 'Mute' }
    ]
  });
});

// Upload custom audio / song (supports multiple MP3, WAV, M4A tracks)
app.post('/api/upload-custom-audio', upload.array('audio', 10), (req, res) => {
  let files = req.files || [];
  if (!files.length && req.file) files = [req.file];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No audio file provided.' });
  }

  const tracks = [];
  for (const f of files) {
    let duration = 5.0;
    try {
      const probeRes = spawnSync(getFfprobePath(), [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'json',
        f.path
      ]);
      const data = JSON.parse(probeRes.stdout.toString());
      if (data.format && data.format.duration) {
        duration = Math.round(parseFloat(data.format.duration) * 10) / 10;
      }
    } catch (e) {}

    tracks.push({
      filename: f.filename,
      originalname: f.originalname || f.filename,
      audioUrl: `/uploads/${f.filename}`,
      audioPath: f.path,
      duration
    });
  }

  res.json({
    success: true,
    tracks,
    filename: tracks[0].filename,
    audioUrl: tracks[0].audioUrl,
    audioPath: tracks[0].audioPath,
    duration: tracks[0].duration
  });
});

// ==========================================
// VIRAL CAPTIONS & SEO HASHTAG GENERATOR
// ==========================================
app.post('/api/generate-captions-hashtags', (req, res) => {
  const { keyword = 'warzone clips', vibe = 'meta' } = req.body;
  const kw = (keyword || 'warzone clips').trim().toLowerCase();

  const isLoadout = /loadout|class|build|attachment|setup|gun|smg|ar|recoil|dmg|damage|melt|meta/.test(kw);
  const isSniper = /sniper|kar98|hdr|snipe|quickscope|headshot|range|bullet/.test(kw);
  const isMovement = /movement|slide|camera|demon|speed|fov|bhop|break/.test(kw);
  const isFunny = /funny|death|comm|rage|bot|hot mic|fail|troll|laugh/.test(kw);

  let captions = [];
  let megaTags = ['#warzone', '#cod', '#callofduty', '#gaming', '#warzoneclips'];
  let nicheTags = [];
  let algoTags = ['#fyp', '#viral', '#gametok', '#gamingontiktok', '#foryoupage'];

  const cleanKw = keyword.trim().toUpperCase();

  if (isLoadout) {
    captions = [
      {
        id: 'cap_1',
        title: '🔥 The "Secret Nerf" Curiosity Hook',
        text: `The devs are 100% nerfing this ${cleanKw} tomorrow... Save this before it's gone 💀🔥 Full tuning at the end 👇`,
        hookScore: '98% (Max Saves)'
      },
      {
        id: 'cap_2',
        title: '💬 The "Is This Broken?" Debate Starter',
        text: `Is this the FASTEST TTK in Warzone history or am I tripping? 🤔 Tag a teammate who needs to switch off their old class.`,
        hookScore: '96% (Max Comments)'
      },
      {
        id: 'cap_3',
        title: '⚡ High TTK Punchy Hook',
        text: `Zero recoil. 400ms TTK. Secret attachments revealed. Thank me later 🤫 Save for your next match!`,
        hookScore: '94% (High Watch-Time)'
      },
      {
        id: 'cap_4',
        title: '🏆 Pro Loadout Comparison',
        text: `Stop copying pro classes until you try this ${cleanKw} build. It literally doesn't move 🤯 What gun should I tune next?`,
        hookScore: '93% (High Shares)'
      }
    ];
    nicheTags = ['#warzoneloadout', '#warzonemeta', '#bestclasssetup', '#codloadout', '#warzonebuilds', '#rebirthmeta'];
  } else if (isSniper) {
    captions = [
      {
        id: 'cap_1',
        title: '🎯 The "Hacker Accusation" Flex',
        text: `They accused me of aimbotting after this snipe... 😭 Should I feel bad? Headshots only with the ${cleanKw} 🎯🔥`,
        hookScore: '97% (Viral Engagement)'
      },
      {
        id: 'cap_2',
        title: '💀 Bullet Drop Secret',
        text: `No bullet drop? This ${cleanKw} setup is hitting 400m one-shots with zero lead. Save this class before they fix it! 💀`,
        hookScore: '95% (Max Saves)'
      },
      {
        id: 'cap_3',
        title: '💬 Controller vs M&K Debate',
        text: `Can controller players hit this or is this strictly keyboard & mouse precision? Rate this snipe 1-10 👇`,
        hookScore: '94% (Comments Boom)'
      },
      {
        id: 'cap_4',
        title: '⚡ Clean Montage Hook',
        text: `The cleanest snipes you'll see on your FYP today. Blink and you'll miss the double collateral 💥`,
        hookScore: '92% (Watch-Time Booster)'
      }
    ];
    nicheTags = ['#warzonesniper', '#codsniper', '#quickscope', '#snipersoftiktok', '#kar98k', '#sniperclips'];
  } else if (isMovement) {
    captions = [
      {
        id: 'cap_1',
        title: '⚡ The "Camera Breaker" Hook',
        text: `How to break cameras like a $100K tournament pro in Warzone 🔥 Follow this exact controller setting for broken movement!`,
        hookScore: '98% (High Saves)'
      },
      {
        id: 'cap_2',
        title: '😭 Sweaty Lobby Flex',
        text: `His ankles are still at Prison... 😭 Ranked Rebirth lobbies have ZERO chill. What FOV are you playing on?`,
        hookScore: '96% (Comments Boom)'
      },
      {
        id: 'cap_3',
        title: '🎯 Slide Cancel Tutorial Hook',
        text: `If you aren't doing this movement trick before gunfights, you're losing 50% of your matches. Watch closely 👀`,
        hookScore: '95% (High Completion)'
      },
      {
        id: 'cap_4',
        title: '🏎️ Movement Demon Energy',
        text: `Too fast for them. Speed demon movement on Rebirth Island ⚡ Drop a follow for daily Warzone clips!`,
        hookScore: '93% (Follows Booster)'
      }
    ];
    nicheTags = ['#warzonemovement', '#camerabreak', '#rebirthisland', '#movementgod', '#codmovement', '#sweatyclips'];
  } else if (isFunny) {
    captions = [
      {
        id: 'cap_1',
        title: '💀 The Rage Quit Hot Mic',
        text: `Listen to his hot mic at the end... HE SMASHED HIS KEYBOARD 😭💀 Funniest death comms of the week!`,
        hookScore: '99% (Max Shares)'
      },
      {
        id: 'cap_2',
        title: '🤡 The Troll Execution',
        text: `I executed him after chasing him across the whole map... Wait for the reaction 💀 What would you do?`,
        hookScore: '97% (High Comments)'
      },
      {
        id: 'cap_3',
        title: '🔊 Volume Warning Comms',
        text: `HEADPHONE WARNING ⚠️ His team was screaming in proximity chat! Tag a friend that rages like this 🤣`,
        hookScore: '95% (Tagging Frenzy)'
      },
      {
        id: 'cap_4',
        title: '🤣 Classic Warzone Timing',
        text: `Only in Warzone... The timing couldn't have been worse 😭 Save this for when you need a good laugh.`,
        hookScore: '92% (Watch-Time)'
      }
    ];
    nicheTags = ['#deathcomms', '#warzonefunny', '#codrage', '#warzonememes', '#proximitychat', '#funnygaming'];
  } else {
    captions = [
      {
        id: 'cap_1',
        title: '🔥 The 1v4 Squad Wipe Clutch',
        text: `My squad died so I had to 1v4 for the win... Heart was beating 180 BPM 💀 Rate this clutch 1-10 👇`,
        hookScore: '98% (High Debate & Comments)'
      },
      {
        id: 'cap_2',
        title: '🚀 Algorithmic Curiosity Hook',
        text: `Stop scrolling if you play Warzone! This secret setting doubled my KD on Rebirth Island overnight 🤯`,
        hookScore: '96% (Max Saves)'
      },
      {
        id: 'cap_3',
        title: '💬 Lobby Debate Starter',
        text: `Are Rebirth lobbies getting sweatier or did the SBMM crank up to 100? Tell me I'm not the only one 🤔`,
        hookScore: '95% (Comments Explosion)'
      },
      {
        id: 'cap_4',
        title: '⚡ Clean Action Hook',
        text: `The cleanest ${cleanKw} you'll see all day. Drop a follow for daily meta clips and loadout tuning! 🔥`,
        hookScore: '93% (Follows Booster)'
      }
    ];
    nicheTags = ['#warzoneclips', '#rebirthisland', '#warzoneplays', '#warzoneclutch', '#codwarzone', '#warzonemeta'];
  }

  const recommendedStack = `${nicheTags.slice(0, 3).join(' ')} ${megaTags.slice(0, 2).join(' ')} #fyp #gametok`;

  res.json({
    success: true,
    keyword,
    vibe,
    captions,
    hashtags: {
      mega: megaTags,
      niche: nicheTags,
      algorithm: algoTags,
      all: [...new Set([...nicheTags, ...megaTags, ...algoTags])]
    },
    recommendedStack,
    seoTips: [
      '🎯 Keep captions under 150 characters so TikTok displays the full hook without truncating ("...more").',
      '💬 Always ask a question (e.g. "Rate 1-10", "What gun next?") — comments are weighted 4x higher in the TikTok algorithm.',
      '📌 Pin your own top comment with the weapon attachment names to double your comment engagement.',
      '⏰ Best posting times for Warzone / COD: 3:30 PM - 7:00 PM in your local timezone.'
    ]
  });
});

// Download video from URL (YouTube, TikTok, Twitch, etc.) via yt-dlp
app.post('/api/download-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Please enter a valid video URL.' });
    }

    const ytDlpPath = getYtDlpPath();

    const uniqueId = Date.now();
    const outputTemplate = path.join(__dirname, 'uploads', `dl_${uniqueId}.%(ext)s`);

    console.log(`Downloading video from URL: ${url}`);
    const dlArgs = [
      '--ffmpeg-location', getFfmpegPath(),
      '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b',
      '--merge-output-format', 'mp4',
      '--max-filesize', '150M',
      '--no-playlist',
      '-o', outputTemplate,
      url
    ];

    const dlProc = spawn(ytDlpPath, dlArgs);
    let stderr = '';
    dlProc.stderr.on('data', d => stderr += d.toString());

    dlProc.on('close', code => {
      const uploadsDir = path.join(__dirname, 'uploads');
      const files = fs.readdirSync(uploadsDir);
      const match = files.find(f => f.startsWith(`dl_${uniqueId}`));

      if (match) {
        const videoPath = path.join(uploadsDir, match);
        const probeRes = spawnSync(getFfprobePath(), [
          '-v', 'error',
          '-show_entries', 'format=duration:stream=width,height,duration',
          '-of', 'json',
          videoPath
        ]);

        let duration = 15;
        let width = 1280;
        let height = 720;
        try {
          const probeData = JSON.parse(probeRes.stdout.toString());
          const stream = probeData.streams && probeData.streams[0] ? probeData.streams[0] : {};
          duration = parseFloat(probeData.format?.duration || stream.duration || 15);
          width = stream.width || 1280;
          height = stream.height || 720;
        } catch (e) {}

        console.log(`Downloaded: ${match} (${duration}s, ${width}x${height})`);
        return res.json({
          success: true,
          filename: match,
          videoUrl: `/uploads/${match}`,
          videoPath,
          duration: Math.round(duration * 10) / 10,
          width,
          height
        });
      } else {
        console.error('yt-dlp download failed:', stderr);
        return res.status(500).json({ error: 'Download failed. The video link might be private or restricted.', details: stderr.slice(-300) });
      }
    });

  } catch (err) {
    console.error('URL download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Download and extract viral MP3 audio from any URL (TikTok, YouTube Short, etc.) via yt-dlp
app.post('/api/download-audio-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Please enter a valid sound or video URL.' });
    }

    const ytDlpPath = getYtDlpPath();

    const uniqueId = Date.now();
    const outputTemplate = path.join(__dirname, 'uploads', `sound_${uniqueId}.%(ext)s`);

    console.log(`Extracting viral audio from URL: ${url}`);
    const dlArgs = [
      '--ffmpeg-location', getFfmpegPath(),
      '-x',
      '--audio-format', 'mp3',
      '--max-filesize', '50M',
      '--no-playlist',
      '-o', outputTemplate,
      url
    ];

    const dlProc = spawn(ytDlpPath, dlArgs);
    let stderr = '';
    dlProc.stderr.on('data', d => stderr += d.toString());

    dlProc.on('close', code => {
      const uploadsDir = path.join(__dirname, 'uploads');
      const files = fs.readdirSync(uploadsDir);
      const match = files.find(f => f.startsWith(`sound_${uniqueId}`));

      if (match) {
        const audioPath = path.join(uploadsDir, match);
        let duration = 15.0;
        try {
          const probeRes = spawnSync(getFfprobePath(), [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'json',
            audioPath
          ]);
          const data = JSON.parse(probeRes.stdout.toString());
          if (data.format && data.format.duration) {
            duration = Math.round(parseFloat(data.format.duration) * 10) / 10;
          }
        } catch (e) {}

        const trackItem = {
          filename: match,
          originalname: match,
          audioUrl: `/uploads/${match}`,
          audioPath: audioPath,
          duration
        };

        return res.json({
          success: true,
          filename: match,
          audioUrl: `/uploads/${match}`,
          audioPath: audioPath,
          duration,
          tracks: [trackItem]
        });
      } else {
        return res.status(500).json({
          error: 'Failed to extract audio from URL. Please check if the link is public.',
          details: stderr.slice(-300)
        });
      }
    });
  } catch (err) {
    console.error('Download audio URL error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Load sample video
app.get('/api/sample-video', (req, res) => {
  const samplePath = path.join(__dirname, 'sample', 'demo_clip.mp4');
  if (!fs.existsSync(samplePath)) {
    return res.status(404).json({ error: 'Sample video not found.' });
  }

  res.json({
    success: true,
    filename: 'demo_clip.mp4',
    videoUrl: '/sample/demo_clip.mp4',
    videoPath: samplePath,
    duration: 15,
    width: 1280,
    height: 720
  });
});

// Helper to check if a video has an audio stream
function hasAudioStream(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return false;
  try {
    const probeRes = spawnSync(getFfprobePath(), [
      '-v', 'error',
      '-select_streams', 'a',
      '-show_entries', 'stream=codec_type',
      '-of', 'json',
      filePath
    ]);
    const probeData = JSON.parse(probeRes.stdout.toString());
    return !!(probeData.streams && probeData.streams.length > 0);
  } catch (e) {
    return false;
  }
}

// Helper to build 9:16 layout, manual crop, facecam removal, caption wipe, hook card, and image overlays
function buildVideoFilter({
  layoutMode = 'blur_pad',
  manualCrop = null,
  facecamFilter = 'none',
  facecamHeight = 33,
  maskOldCaptions = false,
  hookCardMode = 'none',
  imageOverlays = [],
  relativeAss,
  outputLabel = '[vout]'
}) {
  let baseFilter = '';

  if (layoutMode === 'manual_crop') {
    const cropT = Math.min(48, Math.max(0, parseFloat(manualCrop?.cropTop) || 0));
    const cropB = Math.min(48, Math.max(0, parseFloat(manualCrop?.cropBottom) || 0));
    const cropL = Math.min(48, Math.max(0, parseFloat(manualCrop?.cropLeft) || 0));
    const cropR = Math.min(48, Math.max(0, parseFloat(manualCrop?.cropRight) || 0));
    const fitMode = manualCrop?.fitMode || 'fill';

    const cropExpr = `crop=w='in_w*(1-(${cropL}+${cropR})/100)':h='in_h*(1-(${cropT}+${cropB})/100)':x='in_w*(${cropL}/100)':y='in_h*(${cropT}/100)'`;

    if (fitMode === 'blur_fit') {
      baseFilter = `[0:v]${cropExpr}[mcrop];` +
                   `[mcrop]split[mc_fg][mc_bg];` +
                   `[mc_bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:6[bg];` +
                   `[mc_fg]scale=1080:-1:force_original_aspect_ratio=decrease[fg];` +
                   `[bg][fg]overlay=(W-w)/2:(H-h)/2`;
    } else {
      // Zoom to fill 1080x1920
      baseFilter = `[0:v]${cropExpr},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;
    }
  } else if (facecamFilter === 'crop_gameplay') {
    const heightPercent = Math.min(50, Math.max(15, parseInt(facecamHeight) || 33));
    const H_cut = Math.round(1920 * (heightPercent / 100));
    // Cut off the top facecam area, scale remaining gameplay to fill 1080x1920
    baseFilter = `[0:v]scale=1080:1920,crop=1080:(1920-${H_cut}):0:${H_cut},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;
  } else if (facecamFilter === 'cover_banner') {
    const heightPercent = Math.min(50, Math.max(15, parseInt(facecamHeight) || 33));
    const H_cut = Math.round(1920 * (heightPercent / 100));
    // Draw dark tactical banner over the top facecam area with gold accent line
    baseFilter = `[0:v]scale=1080:1920,drawbox=x=0:y=0:w=1080:h=${H_cut}:c=0x0b0c10@0.98:t=fill,drawbox=x=0:y=${H_cut-6}:w=1080:h=6:c=0xF59E0B@1.0:t=fill`;
  } else if (facecamFilter === 'blur_top') {
    const heightPercent = Math.min(50, Math.max(15, parseInt(facecamHeight) || 33));
    const H_cut = Math.round(1920 * (heightPercent / 100));
    // Blur out top facecam area with subtle gold border
    baseFilter = `[0:v]scale=1080:1920[v];[v]split[base][blurm];[blurm]crop=1080:${H_cut}:0:0,boxblur=35:10[blurred];[base][blurred]overlay=0:0,drawbox=x=0:y=${H_cut-4}:w=1080:h=4:c=0xF59E0B@0.8:t=fill`;
  } else {
    // Standard layout modes
    if (layoutMode === 'center_crop') {
      baseFilter = `[0:v]scale=-1:1920,crop=1080:1920`;
    } else {
      // blur_pad
      baseFilter = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg];` +
                   `[0:v]scale=1080:-1[fg];` +
                   `[bg][fg]overlay=(W-w)/2:(H-h)/2`;
    }
  }

  // Hook card overlay / wipe at top
  if (hookCardMode === 'viral_white') {
    // Full-width viral white banner (100% wipe & zero text overflow)
    baseFilter += ',drawbox=x=0:y=50:w=1080:h=240:c=black@0.9:t=fill' +
                  ',drawbox=x=0:y=60:w=1080:h=220:c=white:t=fill' +
                  ',drawbox=x=0:y=56:w=1080:h=4:c=0xFE2C55:t=fill' +
                  ',drawbox=x=0:y=280:w=1080:h=4:c=0x25F4EE:t=fill';
  } else if (hookCardMode === 'wide_card') {
    // Wide floating card (1000px centered with clean trim & background wipe)
    baseFilter += ',drawbox=x=0:y=50:w=1080:h=240:c=black@0.7:t=fill' +
                  ',drawbox=x=40:y=65:w=1000:h=210:c=white:t=fill' +
                  ',drawbox=x=40:y=65:w=1000:h=4:c=0xFE2C55:t=fill' +
                  ',drawbox=x=40:y=271:w=1000:h=4:c=0x25F4EE:t=fill';
  } else if (hookCardMode === 'cod_tactical') {
    // Dark tactical carbon card with gold border
    baseFilter += ',drawbox=x=0:y=50:w=1080:h=240:c=black@0.9:t=fill' +
                  ',drawbox=x=0:y=60:w=1080:h=220:c=0x0B0C10@0.98:t=fill' +
                  ',drawbox=x=0:y=56:w=1080:h=4:c=0xF59E0B:t=fill' +
                  ',drawbox=x=0:y=280:w=1080:h=4:c=0xF59E0B:t=fill';
  } else if (hookCardMode === 'wipe_only') {
    // Complete wipe of top banner zone
    baseFilter += ',drawbox=x=0:y=50:w=1080:h=240:c=black@0.9:t=fill';
  }

  let currentV = '[v_pre_ov]';
  let filterSections = [];

  if (maskOldCaptions) {
    filterSections.push(
      `${baseFilter}[vbase];` +
      `[vbase]split[v1][vmask];` +
      `[vmask]crop=920:190:80:880,boxblur=30:8[vblurred];` +
      `[v1][vblurred]overlay=80:880${currentV}`
    );
  } else {
    filterSections.push(`${baseFilter}${currentV}`);
  }

  // Chain image overlays
  if (Array.isArray(imageOverlays) && imageOverlays.length > 0) {
    imageOverlays.forEach((ov, idx) => {
      const idxInput = ov.inputIndex;
      const sTime = Math.max(0, parseFloat(ov.startTime) || 0);
      const eTime = Math.max(sTime + 0.5, parseFloat(ov.endTime) || (sTime + 4));
      const pos = ov.position || 'center';
      const border = ov.borderStyle || 'cod_gold';
      const targetW = Math.min(1060, Math.max(200, parseInt(ov.scaleWidth) || (pos.startsWith('pip') ? 440 : 920)));

      // Optional manual picture crop
      const iCropT = Math.min(45, Math.max(0, parseFloat(ov.cropTop) || 0));
      const iCropB = Math.min(45, Math.max(0, parseFloat(ov.cropBottom) || 0));
      const iCropL = Math.min(45, Math.max(0, parseFloat(ov.cropLeft) || 0));
      const iCropR = Math.min(45, Math.max(0, parseFloat(ov.cropRight) || 0));

      let imgPrep = `[${idxInput}:v]`;
      if (iCropT > 0 || iCropB > 0 || iCropL > 0 || iCropR > 0) {
        imgPrep += `crop=w='iw*(1-(${iCropL}+${iCropR})/100)':h='ih*(1-(${iCropT}+${iCropB})/100)':x='iw*(${iCropL}/100)':y='ih*(${iCropT}/100)',`;
      }

      if (pos === 'fullscreen') {
        imgPrep += `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(1080-iw)/2:(1920-ih)/2:color=black@0.0`;
      } else {
        imgPrep += `scale=${targetW}:-1`;
      }

      // Add tactical border if desired
      if (border === 'cod_gold') {
        imgPrep += `,drawbox=x=0:y=0:w=iw:h=ih:c=0xF59E0B@1.0:t=6`;
      } else if (border === 'viral_red') {
        imgPrep += `,drawbox=x=0:y=0:w=iw:h=ih:c=0xE11D48@1.0:t=6`;
      } else if (border === 'tactical_dark') {
        imgPrep += `,drawbox=x=0:y=0:w=iw:h=ih:c=0x1e293b@1.0:t=6`;
      }

      const imgLabel = `[img_ov_${idx}]`;
      const nextV = `[v_post_ov_${idx}]`;

      let xPos = '(W-w)/2';
      let yPos = '(H-h)/2';
      if (pos === 'top') {
        yPos = '280';
      } else if (pos === 'bottom') {
        yPos = 'H-h-240';
      } else if (pos === 'pip_tr') {
        xPos = 'W-w-50';
        yPos = '180';
      } else if (pos === 'pip_br') {
        xPos = 'W-w-50';
        yPos = 'H-h-240';
      } else if (pos === 'fullscreen') {
        xPos = '0';
        yPos = '0';
      }

      filterSections.push(`${imgPrep}${imgLabel}`);
      filterSections.push(`${currentV}${imgLabel}overlay=${xPos}:${yPos}:enable='between(t\\,${sTime}\\,${eTime})'${nextV}`);
      currentV = nextV;
    });
  }

  // Subtitles at the very top of the visual stack
  if (relativeAss) {
    filterSections.push(`${currentV}subtitles=${relativeAss}${outputLabel}`);
  } else {
    filterSections.push(`${currentV}null${outputLabel}`);
  }

  return filterSections.join(';');
}

// Helper to extract active end-card slides (supports multiple slides!)
function extractActiveEndCards(endCards, endCard, imageOverlays) {
  let list = [];
  if (Array.isArray(endCards) && endCards.length > 0) {
    list = endCards;
  } else if (endCard && endCard.imagePath) {
    list = [endCard];
  } else if (Array.isArray(imageOverlays)) {
    list = imageOverlays.filter(ov => ov && (ov.isEndCard || ov.position === 'endcard'));
  }

  const active = [];
  list.forEach((item, idx) => {
    if (item && item.imagePath && fs.existsSync(item.imagePath) && item.enabled !== false) {
      active.push({
        id: item.id || `slide_${idx + 1}`,
        imagePath: item.imagePath,
        duration: Math.max(1, Math.min(10, parseFloat(item.duration) || 3)),
        zoom: Math.max(1.0, Math.min(2.5, parseFloat(item.zoom) || 1.45)),
        focus: item.focus || 'left',
        title: item.title || (list.length > 1 ? `LOADOUT SETUP [${idx + 1}/${list.length}]` : 'SAVE THIS CLASS SETUP [BEST META]'),
        subtitle: item.subtitle || 'Screenshot & save for your next match'
      });
    }
  });
  return active;
}

// Clean, consistent, zoomed end-card outro builder with zero clashing red lines
function buildEndCardFilters(activeEndCards) {
  let endSlidesFilters = '';
  let concatLabels = '[v0]';

  activeEndCards.forEach((ec, i) => {
    const inIdx = ec.inputIndex;
    const zoom = Math.max(1.0, Math.min(2.5, parseFloat(ec.zoom) || 1.45));
    const focus = ec.focus || 'left';
    const targetW = Math.round(1080 * zoom);

    // Focus crop horizontally on attachments so text is large and razor-sharp
    let cropX = `(iw-1080)/2`;
    if (focus === 'left') {
      cropX = `min(50\\, max(0\\, (iw-1080)/2))`;
    } else if (focus === 'right') {
      cropX = `max(0\\, iw-1080-40)`;
    }

    endSlidesFilters += 
      `[${inIdx}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:6,drawbox=x=0:y=0:w=1080:h=1920:c=black@0.55:t=fill[end_bg_${i}];` +
      `[${inIdx}:v]scale=${targetW}:-1,crop=min(iw\\,1080):ih:${cropX}:0,drawbox=x=0:y=0:w=iw:h=ih:c=0xF59E0B@0.85:t=4[end_fg_${i}];` +
      `[end_bg_${i}][end_fg_${i}]overlay=(W-w)/2:(H-h)/2,` +
      `drawbox=x=0:y=0:w=1080:h=230:c=black@0.92:t=fill,` +
      `drawbox=x=0:y=226:w=1080:h=4:c=0xF59E0B:t=fill,` +
      `drawbox=x=0:y=1680:w=1080:h=150:c=black@0.88:t=fill,` +
      `drawbox=x=0:y=1680:w=1080:h=3:c=0xF59E0B:t=fill,` +
      `fps=30,setsar=1[v_end_${i}];`;
    concatLabels += `[v_end_${i}]`;
  });

  return { endSlidesFilters, concatLabels };
}

// Helper to resolve an audio path from absolute path, relative path, or filename
function resolveAudioFilePath(rawPath, filename) {
  if (!rawPath && !filename) return null;

  // 1. Direct path check
  if (rawPath && typeof rawPath === 'string' && fs.existsSync(rawPath)) {
    return rawPath;
  }

  // 2. Stripped relative check
  if (rawPath && typeof rawPath === 'string') {
    const stripped = rawPath.replace(/^[\\\/]+/, '');
    const p1 = path.join(__dirname, stripped);
    if (fs.existsSync(p1)) return p1;

    const baseName = path.basename(stripped);
    const p2 = path.join(__dirname, 'uploads', baseName);
    if (fs.existsSync(p2)) return p2;
  }

  // 3. Filename check in uploads/
  if (filename && typeof filename === 'string') {
    const baseName = path.basename(filename);
    const p3 = path.join(__dirname, 'uploads', baseName);
    if (fs.existsSync(p3)) return p3;
  }

  return null;
}

// Helper to resolve audio tracks from multi-track array, single custom audio, or preset
function resolveAudioTracks(customAudioTracks, customAudioPath, bgMusicTrack) {
  let tracks = [];
  if (Array.isArray(customAudioTracks) && customAudioTracks.length > 0) {
    customAudioTracks.forEach((t) => {
      const p = resolveAudioFilePath(t.audioPath || t.path || t.audioUrl, t.filename || t.originalname);
      if (p) {
        tracks.push({
          audioPath: p,
          filename: t.filename || t.originalname || path.basename(p),
          duration: parseFloat(t.duration) || 0
        });
      }
    });
  }

  // Fallback to legacy customAudioPath if no tracks found
  if (tracks.length === 0 && customAudioPath) {
    const p = resolveAudioFilePath(customAudioPath);
    if (p) {
      tracks.push({
        audioPath: p,
        filename: path.basename(p),
        duration: 0
      });
    }
  }

  // If still no tracks, use preset track if selected
  if (tracks.length === 0 && bgMusicTrack && bgMusicTrack !== 'none' && WARZONE_TRACKS[bgMusicTrack] && fs.existsSync(WARZONE_TRACKS[bgMusicTrack])) {
    tracks.push({
      audioPath: WARZONE_TRACKS[bgMusicTrack],
      filename: `${bgMusicTrack}.wav`,
      duration: 0,
      isPreset: true
    });
  }
  return tracks;
}

// Build audio filter complex for multi-track sequential playback
function buildAudioFilterGraph({
  resolvedAudioTracks,
  trackStartIndex,
  totalDuration,
  origAudioMode,
  targetHasAudio,
  bgmVolume = 1.0,
  voiceInputLabel = null, // e.g. '[voice]' if voiceover is present
  includeBeat = false
}) {
  const hasTracks = resolvedAudioTracks && resolvedAudioTracks.length > 0;
  let bgmFilter = '';

  if (hasTracks) {
    if (resolvedAudioTracks.length === 1) {
      // 1 track: format to 44.1kHz stereo, loop seamlessly across totalDuration, pad, and trim
      bgmFilter = `[${trackStartIndex}:a]aresample=44100,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,aloop=loop=-1:size=2e+09,asetpts=N/SR/TB,apad,atrim=0:${totalDuration},volume=${bgmVolume}[bgm]`;
    } else {
      let seqFilters = '';
      let seqInputs = '';
      resolvedAudioTracks.forEach((t, k) => {
        const inIdx = trackStartIndex + k;
        seqFilters += `[${inIdx}:a]aresample=44100,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[at_${k}];`;
        seqInputs += `[at_${k}]`;
      });
      seqFilters += `${seqInputs}concat=n=${resolvedAudioTracks.length}:v=0:a=1,asetpts=N/SR/TB[bgm_seq];`;
      seqFilters += `[bgm_seq]aloop=loop=-1:size=2e+09,asetpts=N/SR/TB,apad,atrim=0:${totalDuration},volume=${bgmVolume}[bgm]`;
      bgmFilter = seqFilters;
    }
  }

  // If there's an AI voiceover (in auto-create mode)
  if (voiceInputLabel) {
    if (origAudioMode === 'mute') {
      if (hasTracks) {
        return {
          filterString: `${bgmFilter};${voiceInputLabel}[bgm]amix=inputs=2:duration=longest[aout]`,
          audioMap: '[aout]'
        };
      } else if (includeBeat) {
        return {
          filterString: `aevalsrc=sin(2*PI*55*t)*exp(-4*mod(t\\,0.5)):s=44100:d=${totalDuration}[beat];[beat]volume=0.15[music];${voiceInputLabel}[music]amix=inputs=2:duration=longest[aout]`,
          audioMap: '[aout]'
        };
      } else {
        return {
          filterString: `${voiceInputLabel}volume=1.0[aout]`,
          audioMap: '[aout]'
        };
      }
    } else if (origAudioMode === 'low') {
      if (hasTracks && targetHasAudio) {
        return {
          filterString: `${bgmFilter};[0:a]volume=0.15[game];${voiceInputLabel}[game][bgm]amix=inputs=3:duration=longest[aout]`,
          audioMap: '[aout]'
        };
      } else if (hasTracks && !targetHasAudio) {
        return {
          filterString: `${bgmFilter};${voiceInputLabel}[bgm]amix=inputs=2:duration=longest[aout]`,
          audioMap: '[aout]'
        };
      } else if (!hasTracks && targetHasAudio) {
        return {
          filterString: `[0:a]volume=0.15[game];${voiceInputLabel}[game]amix=inputs=2:duration=longest[aout]`,
          audioMap: '[aout]'
        };
      } else {
        return {
          filterString: `${voiceInputLabel}volume=1.0[aout]`,
          audioMap: '[aout]'
        };
      }
    } else { // 'full'
      if (hasTracks && targetHasAudio) {
        return {
          filterString: `${bgmFilter};[0:a]volume=0.8[game];${voiceInputLabel}[game][bgm]amix=inputs=3:duration=longest[aout]`,
          audioMap: '[aout]'
        };
      } else if (hasTracks && !targetHasAudio) {
        return {
          filterString: `${bgmFilter};${voiceInputLabel}[bgm]amix=inputs=2:duration=longest[aout]`,
          audioMap: '[aout]'
        };
      } else if (!hasTracks && targetHasAudio) {
        return {
          filterString: `[0:a]volume=0.8[game];${voiceInputLabel}[game]amix=inputs=2:duration=longest[aout]`,
          audioMap: '[aout]'
        };
      } else {
        return {
          filterString: `${voiceInputLabel}volume=1.0[aout]`,
          audioMap: '[aout]'
        };
      }
    }
  }

  // Standard clipper mode (no voiceover, purely clip audio + multi-track bgm)
  if (origAudioMode === 'mute') {
    if (hasTracks) {
      return {
        filterString: bgmFilter,
        audioMap: '[bgm]'
      };
    } else {
      return { filterString: '', audioMap: null };
    }
  } else if (origAudioMode === 'low') {
    if (hasTracks && targetHasAudio) {
      return {
        filterString: `${bgmFilter};[0:a]volume=0.15[game];[game][bgm]amix=inputs=2:duration=longest[aout]`,
        audioMap: '[aout]'
      };
    } else if (hasTracks && !targetHasAudio) {
      return {
        filterString: bgmFilter,
        audioMap: '[bgm]'
      };
    } else if (!hasTracks && targetHasAudio) {
      return {
        filterString: `[0:a]volume=0.18[aout]`,
        audioMap: '[aout]'
      };
    } else {
      return { filterString: '', audioMap: null };
    }
  } else { // 'full'
    if (hasTracks && targetHasAudio) {
      return {
        filterString: `${bgmFilter};[0:a]volume=1.0[game];[game][bgm]amix=inputs=2:duration=longest[aout]`,
        audioMap: '[aout]'
      };
    } else if (hasTracks && !targetHasAudio) {
      return {
        filterString: bgmFilter,
        audioMap: '[bgm]'
      };
    } else if (!hasTracks && targetHasAudio) {
      return { filterString: '', audioMap: '0:a' };
    } else {
      return { filterString: '', audioMap: null };
    }
  }
}

// Render 9:16 Vertical Short with Subtitles
app.post('/api/render-short', (req, res) => {
  try {
    const {
      videoPath,
      startTime = 0,
      endTime = 10,
      layoutMode = 'blur_pad', // 'blur_pad', 'center_crop', or 'manual_crop'
      manualCrop = null,
      facecamFilter = 'none', // 'none', 'crop_gameplay', 'cover_banner', 'blur_top'
      facecamHeight = 33,
      maskOldCaptions = false,
      hookCardMode = 'none',
      hookCardText = '',
      imageOverlays = [],
      endCard = null,
      endCards = null, // Array of { id, imagePath, duration, title, subtitle }
      bgMusicTrack = 'none',
      customAudioPath = null,
      customAudioTracks = null, // Array of { audioPath, duration, filename }
      origAudioMode = 'mute', // 'mute' (clean repost default), 'low' (gameplay FX only), 'full' (100%)
      bannerText = '',
      subtitleStyle = 'hormozi', // 'hormozi', 'beast', 'cyber', 'minimal', 'warzone'
      subtitlePosition = 'middle', // 'middle', 'lower'
      subtitleText = '',
      subtitlePacing = 'fast'
    } = req.body;

    let targetInput = videoPath;
    if (!targetInput || !fs.existsSync(targetInput)) {
      // Fallback to sample video if path invalid
      targetInput = path.join(__dirname, 'sample', 'demo_clip.mp4');
    }

    const duration = Math.max(1, parseFloat(endTime) - parseFloat(startTime));
    const timestamp = Date.now();
    const outputFileName = `short_${timestamp}.mp4`;
    const outputPath = path.join(__dirname, 'output', outputFileName);
    const assFileName = `sub_${timestamp}.ass`;
    const assFilePath = path.join(__dirname, 'output', assFileName);

    // Extract active end-card slides
    const activeEndCards = extractActiveEndCards(endCards, endCard, imageOverlays);
    const hasEndCard = activeEndCards.length > 0;
    const totalEndCardDuration = activeEndCards.reduce((acc, c) => acc + c.duration, 0);
    const totalDuration = duration + totalEndCardDuration;

    // Filter in-video overlays (exclude any slides meant for end-card outro)
    const inVideoOverlays = [];
    if (Array.isArray(imageOverlays)) {
      imageOverlays.forEach(ov => {
        if (ov && ov.imagePath && fs.existsSync(ov.imagePath) && !ov.isEndCard && ov.position !== 'endcard') {
          inVideoOverlays.push(ov);
        }
      });
    }

    // Number in-video overlays
    inVideoOverlays.forEach((ov, idx) => {
      ov.inputIndex = 1 + idx;
    });

    // Build ASS subtitle file
    const assContent = generateAssSubtitles({
      text: subtitleText,
      duration,
      styleName: subtitleStyle,
      position: subtitlePosition,
      bannerText: facecamFilter === 'cover_banner' ? bannerText : '',
      facecamHeight,
      hookCardMode,
      hookCardText,
      endCards: activeEndCards,
      subtitlePacing
    });
    fs.writeFileSync(assFilePath, assContent, 'utf-8');

    // Build FFmpeg filtergraph for 9:16 (1080x1920)
    const relativeAssPath = `output/${assFileName}`.replace(/\\/g, '/');

    const vFilterRaw = buildVideoFilter({
      layoutMode,
      manualCrop,
      facecamFilter,
      facecamHeight,
      maskOldCaptions,
      hookCardMode,
      imageOverlays: inVideoOverlays,
      relativeAss: null,
      outputLabel: '[v0_raw]'
    });

    const targetHasAudio = hasAudioStream(targetInput);

    // Resolve audio tracks (supports multiple sequential MP3s)
    const resolvedAudioTracks = resolveAudioTracks(customAudioTracks, customAudioPath, bgMusicTrack);

    const ffmpegPath = getFfmpegPath();
    const ffmpegArgs = [
      '-y',
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-i', targetInput
    ];

    // Add in-video overlay inputs
    inVideoOverlays.forEach(ov => {
      ffmpegArgs.push('-i', ov.imagePath);
    });

    // Add multiple End-Card inputs if active
    activeEndCards.forEach((ec, idx) => {
      ec.inputIndex = 1 + inVideoOverlays.length + idx;
      ffmpegArgs.push('-loop', '1', '-t', ec.duration.toString(), '-i', ec.imagePath);
    });

    // Add background music track input(s)
    const trackInputIndex = (1 + inVideoOverlays.length + activeEndCards.length);
    if (resolvedAudioTracks.length > 0) {
      resolvedAudioTracks.forEach(t => {
        ffmpegArgs.push('-i', t.audioPath);
      });
    }

    // Compose video filter with optional end-card concat
    let videoFilterComplex = '';
    if (hasEndCard) {
      const { endSlidesFilters, concatLabels } = buildEndCardFilters(activeEndCards);

      videoFilterComplex = `${vFilterRaw};[v0_raw]fps=30,setsar=1[v0];` +
        endSlidesFilters +
        `${concatLabels}concat=n=${1 + activeEndCards.length}:v=1:a=0[vcat];` +
        `[vcat]subtitles=${relativeAssPath}[vout]`;
    } else {
      videoFilterComplex = `${vFilterRaw};[v0_raw]subtitles=${relativeAssPath}[vout]`;
    }

    // Calculate effective BGM volume: full 1.0 (100%) when original audio is muted!
    let effectiveBgmVol = 1.0;
    if (origAudioMode === 'low') effectiveBgmVol = 0.85;
    else if (origAudioMode === 'full') effectiveBgmVol = 0.45;

    // Build audio filter chain (supports multi-track concat, looping, padding, & ducking)
    const { filterString: audioFilterStr, audioMap } = buildAudioFilterGraph({
      resolvedAudioTracks,
      trackStartIndex: trackInputIndex,
      totalDuration,
      origAudioMode,
      targetHasAudio,
      bgmVolume: effectiveBgmVol
    });

    if (audioFilterStr) {
      videoFilterComplex = `${videoFilterComplex};${audioFilterStr}`;
    }

    ffmpegArgs.push(
      '-filter_complex', videoFilterComplex,
      '-map', '[vout]'
    );

    if (audioMap) {
      ffmpegArgs.push('-map', audioMap, '-c:a', 'aac', '-b:a', '128k');
    } else {
      ffmpegArgs.push('-an');
    }

    ffmpegArgs.push(
      '-t', totalDuration.toString(),
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-pix_fmt', 'yuv420p',
      outputPath
    );

    console.log(`Starting FFmpeg render for ${outputFileName} (facecam: ${facecamFilter})...`);
    const proc = spawn(ffmpegPath, ffmpegArgs, { cwd: __dirname });

    let stderrData = '';
    proc.stderr.on('data', data => {
      stderrData += data.toString();
    });

    proc.on('close', code => {
      // Clean up temporary ASS file
      if (fs.existsSync(assFilePath)) {
        try { fs.unlinkSync(assFilePath); } catch (e) {}
      }

      if (code === 0 && fs.existsSync(outputPath)) {
        console.log(`Render complete: ${outputFileName}`);
        return res.json({
          success: true,
          outputUrl: `/output/${outputFileName}`,
          filename: outputFileName,
          duration: totalDuration,
          hasEndCard,
          width: 1080,
          height: 1920
        });
      } else {
        console.error('FFmpeg render failed:', stderrData);
        return res.status(500).json({
          error: 'Video rendering failed',
          details: stderrData.slice(-400)
        });
      }
    });

  } catch (err) {
    console.error('Render short error:', err);
    res.status(500).json({ error: err.message });
  }
});

function sanitizeForAss(str) {
  if (!str) return '';
  return str.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
}

function wrapTitleText(text, maxChars = 24) {
  if (!text) return '';
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;
  const words = clean.split(/\s+/);
  let lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxChars) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3).join('\\N');
}

function generateAssSubtitles({
  text,
  duration,
  styleName,
  position,
  bannerText = '',
  facecamHeight = 33,
  hookCardMode = 'none',
  hookCardText = '',
  endCard = null,
  endCards = null,
  subtitlePacing = 'fast'
}) {
  // Styles definitions in ASS format
  // Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic...
  // Colours in ASS are &HAABBGGRR (Hex)
  const stylesMap = {
    hormozi: 'Style: DefaultStyle,Impact,74,&H0000FFFF,&H0000FFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,9,4,2,40,40',
    warzone: 'Style: DefaultStyle,Impact,78,&H0000A5FF,&H0000A5FF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,10,5,2,40,40',
    beast: 'Style: DefaultStyle,Arial,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,8,5,2,40,40',
    cyber: 'Style: DefaultStyle,Courier New,72,&H00FFFF00,&H00FFFF00,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,7,3,2,40,40',
    minimal: 'Style: DefaultStyle,Arial,66,&H00FFFFFF,&H00FFFFFF,&H00000000,&H60000000,1,0,0,0,100,100,0,0,1,5,2,2,40,40'
  };

  const chosenStyle = stylesMap[styleName] || stylesMap.warzone;
  // Position vertical margin: middle = 920, lower = 360
  const marginV = position === 'middle' ? '920,1' : '360,1';
  let styleLine = `${chosenStyle},${marginV}`;

  // STRICT gameplay cutoff: subtitles & banners strictly end BEFORE the outro slides start!
  const safeGameplayDur = Math.max(0.1, duration - 0.05);
  const durFormatted = formatAssTime(safeGameplayDur);

  let bannerDialogue = '';
  if (bannerText && bannerText.trim()) {
    const H_cut = Math.round(1920 * ((parseInt(facecamHeight) || 33) / 100));
    const bannerPosY = Math.round(H_cut / 2);
    styleLine += `\nStyle: BannerStyle,Impact,62,&H0000FFFF,&H0000FFFF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,8,4,8,20,20,300,1`;
    const cleanBanner = sanitizeForAss(bannerText).toUpperCase();
    bannerDialogue = `Dialogue: 0,0:00:00.00,${durFormatted},BannerStyle,,0,0,0,,{\\an8\\pos(540,${bannerPosY})\\c&H00D26A&\\b1}⚡ ${cleanBanner} ⚡\n`;
  }

  let hookCardDialogue = '';
  if (hookCardMode !== 'none' && hookCardMode !== 'wipe_only' && hookCardText && hookCardText.trim()) {
    const cleanHook = sanitizeForAss(hookCardText) || hookCardText.trim();
    const wrappedText = wrapTitleText(cleanHook, 24);
    // Use high-contrast crisp text with clean outline so it never looks dark-on-dark
    styleLine += `\nStyle: HookCardStyle,Impact,48,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,6,3,5,20,20,10,1`;
    hookCardDialogue = `Dialogue: 0,0:00:00.00,${durFormatted},HookCardStyle,,0,0,0,,{\\an5\\pos(540,170)\\c&H00FFFF&}${wrappedText}\n`;
  }

  // End-Card Outro Slide Subtitles (supports multiple sequential weapon slides)
  let endCardDialogue = '';
  const slides = Array.isArray(endCards) && endCards.length > 0 
    ? endCards 
    : (endCard && endCard.imagePath ? [endCard] : []);

  if (slides.length > 0) {
    styleLine += `\nStyle: EndCardTitle,Impact,52,&H0000A5FF,&H0000A5FF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,7,3,5,20,20,10,1`;
    styleLine += `\nStyle: EndCardSub,Arial,36,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,5,2,5,20,20,10,1`;

    let curStart = duration;
    slides.forEach((ec, idx) => {
      const dur = Math.max(1, Math.min(10, parseFloat(ec.duration) || 3));
      const startFmt = formatAssTime(curStart);
      const endFmt = formatAssTime(curStart + dur);
      curStart += dur;

      const rawTitle = sanitizeForAss(ec.title) || (slides.length > 1 ? `LOADOUT SETUP [${idx + 1}/${slides.length}]` : 'SAVE THIS CLASS SETUP');
      const titleText = rawTitle.toUpperCase();
      const rawSub = sanitizeForAss(ec.subtitle) || 'Screenshot & save for your next match';

      endCardDialogue += `Dialogue: 0,${startFmt},${endFmt},EndCardTitle,,0,0,0,,{\\an5\\pos(540,115)}${titleText}\n` +
                        `Dialogue: 0,${startFmt},${endFmt},EndCardSub,,0,0,0,,{\\an5\\pos(540,1755)}${rawSub}\n`;
    });
  }

  // Parse text into phrases:
  // 1. If user used multiple lines in the textarea, treat each line as an explicit timed caption scene!
  const rawLines = (text || '').split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let phrases = [];
  if (rawLines.length > 1) {
    phrases = rawLines.map(l => sanitizeForAss(l).toUpperCase());
  } else {
    let words = (text || 'STOP SCROLLING! THIS WEAPON CLASS IS STRAIGHT-UP ILLEGAL').trim().split(/\s+/);
    if (words.length === 0 || words[0] === '') {
      words = ['STOP', 'SCROLLING', 'RIGHT', 'NOW', 'THIS', 'CHANGES', 'EVERYTHING'];
    }
    const numWords = (subtitlePacing === 'hyper') ? 2 : (subtitlePacing === 'fast' ? 3 : 4);
    for (let i = 0; i < words.length; i += numWords) {
      phrases.push(words.slice(i, i + numWords).join(' ').toUpperCase());
    }
  }

  // 2. Calculate timing per phrase based on chosen pacing
  let targetPhraseDur;
  if (subtitlePacing === 'hyper') {
    targetPhraseDur = 0.8;
  } else if (subtitlePacing === 'fast') {
    targetPhraseDur = 1.2;
  } else if (subtitlePacing === 'normal') {
    targetPhraseDur = 1.8;
  } else if (subtitlePacing === 'relaxed') {
    targetPhraseDur = 2.4;
  } else {
    // 'auto': distribute evenly across duration
    targetPhraseDur = duration / Math.max(1, phrases.length);
  }
  // Cap phrase duration so captions are punchy and never stuck for 10 seconds
  targetPhraseDur = Math.min(3.0, Math.max(0.6, targetPhraseDur));

  let events = bannerDialogue + hookCardDialogue + endCardDialogue;
  let curTime = 0;

  phrases.forEach((phrase, idx) => {
    if (curTime >= duration) return;
    // Each phrase only displays for targetPhraseDur, then cleanly vanishes so remaining seconds stay clean!
    const rawEnd = Math.min(curTime + targetPhraseDur, duration);
    const safeEnd = Math.min(rawEnd, duration - 0.05);

    if (safeEnd > curTime) {
      const startFormatted = formatAssTime(curTime);
      const endFormatted = formatAssTime(safeEnd);
      events += `Dialogue: 0,${startFormatted},${endFormatted},DefaultStyle,,0,0,0,,${phrase}\n`;
    }
    curTime += targetPhraseDur;
  });

  return `[Script Info]
Title: TikTok Kinetic Subtitles
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${styleLine}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}
`;
}

function formatAssTime(sec) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);
  const centis = Math.floor((sec % 1) * 100);

  const pad = (n, width = 2) => String(n).padStart(width, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

// ==========================================
// 4. 1-CLICK COMPLETE VIDEO AUTO-GENERATOR
// ==========================================
app.post('/api/auto-create-video', async (req, res) => {
  try {
    const {
      scriptText,
      videoPath,
      startTime = 0,
      layoutMode = 'blur_pad',
      manualCrop = null,
      facecamFilter = 'none',
      facecamHeight = 33,
      maskOldCaptions = false,
      hookCardMode = 'viral_white',
      hookCardText = '',
      imageOverlays = [],
      endCard = null,
      endCards = null,
      bgMusicTrack = 'phonk_drift',
      customAudioPath = null,
      customAudioTracks = null,
      origAudioMode = 'mute', // 'mute' (clean repost default), 'low' (game SFX), 'full' (100%)
      bannerText = '',
      backgroundType = 'gameplay',
      subtitleStyle = 'warzone',
      subtitlePosition = 'middle',
      includeBeat = true,
      aiVoice = 'christopher'
    } = req.body;

    const rawText = (scriptText || "Stop using your current class in Warzone right now! This broken SMG melts in 420 milliseconds with zero recoil. Save this video before your next match!").trim();
    const timestamp = Date.now();
    const voiceWav = path.join(__dirname, 'output', `voice_${timestamp}.wav`);
    const assFile = path.join(__dirname, 'output', `sub_${timestamp}.ass`);
    const outputFile = `autoshort_${timestamp}.mp4`;
    const outputPath = path.join(__dirname, 'output', outputFile);

    // 1. Generate Voiceover via Cross-Platform TTS (Edge TTS or PowerShell fallback)
    await generateVoiceoverAudio(rawText, voiceWav, aiVoice);

    // 2. Measure Voiceover Duration
    const probeRes = spawnSync(getFfprobePath(), [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'json',
      voiceWav
    ]);
    const duration = Math.max(3, parseFloat(JSON.parse(probeRes.stdout.toString()).format.duration));

    // Extract active end-card slides
    const activeEndCards = extractActiveEndCards(endCards, endCard, imageOverlays);
    const hasEndCard = activeEndCards.length > 0;
    const totalEndCardDuration = activeEndCards.reduce((acc, c) => acc + c.duration, 0);
    const totalDuration = duration + totalEndCardDuration;

    // Filter in-video overlays
    const inVideoOverlays = [];
    if (Array.isArray(imageOverlays)) {
      imageOverlays.forEach(ov => {
        if (ov && ov.imagePath && fs.existsSync(ov.imagePath) && !ov.isEndCard && ov.position !== 'endcard') {
          inVideoOverlays.push(ov);
        }
      });
    }

    inVideoOverlays.forEach((ov, idx) => {
      ov.inputIndex = 2 + idx; // 0 is video, 1 is voiceWav
    });

    // 3. Generate ASS Subtitles matching voiceover timing & optional end-cards
    const assContent = generateAssSubtitles({
      text: rawText,
      duration,
      styleName: subtitleStyle,
      position: subtitlePosition,
      bannerText: facecamFilter === 'cover_banner' ? bannerText : '',
      facecamHeight,
      hookCardMode,
      hookCardText,
      endCards: activeEndCards,
      subtitlePacing: req.body.subtitlePacing || 'fast'
    });
    fs.writeFileSync(assFile, assContent, 'utf-8');

    // 4. Setup Video Background
    const relativeAss = `output/sub_${timestamp}.ass`.replace(/\\/g, '/');
    const ffmpegPath = getFfmpegPath();
    let ffmpegArgs = [];

    // Find best target video: explicit user video -> latest uploaded/imported clip -> sample clip
    let targetVideo = null;
    const actualStart = Math.max(0, parseFloat(startTime) || 0);

    if (videoPath && fs.existsSync(videoPath)) {
      targetVideo = videoPath;
    } else {
      const uploadsDir = path.join(__dirname, 'uploads');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir)
          .filter(f => f.endsWith('.mp4') || f.endsWith('.mkv') || f.endsWith('.mov'))
          .map(f => ({ path: path.join(uploadsDir, f), time: fs.statSync(path.join(uploadsDir, f)).mtimeMs }))
          .sort((a, b) => b.time - a.time);
        if (files.length > 0) {
          targetVideo = files[0].path;
        }
      }
      if (!targetVideo) {
        const samplePath = path.join(__dirname, 'sample', 'demo_clip.mp4');
        if (fs.existsSync(samplePath)) targetVideo = samplePath;
      }
    }

    if (backgroundType !== 'cyber_hud' && targetVideo) {
      console.log(`Auto-create using background video: ${targetVideo} (start: ${actualStart}s, layout: ${layoutMode}, facecam: ${facecamFilter}, music: ${bgMusicTrack}, origAudio: ${origAudioMode})`);

      const vFilterRaw = buildVideoFilter({
        layoutMode,
        manualCrop,
        facecamFilter,
        facecamHeight,
        maskOldCaptions,
        hookCardMode,
        imageOverlays: inVideoOverlays,
        relativeAss: null,
        outputLabel: '[v0_raw]'
      });

      const targetHasAudio = hasAudioStream(targetVideo);

      // Resolve audio tracks (supports multiple sequential MP3s)
      const resolvedAudioTracks = resolveAudioTracks(customAudioTracks, customAudioPath, bgMusicTrack);

      ffmpegArgs = [
        '-y',
        '-stream_loop', '-1',
        '-ss', actualStart.toString(),
        '-i', targetVideo,
        '-i', voiceWav
      ];

      inVideoOverlays.forEach(ov => {
        ffmpegArgs.push('-i', ov.imagePath);
      });

      // Add multiple End-Card inputs if active
      activeEndCards.forEach((ec, idx) => {
        ec.inputIndex = 2 + inVideoOverlays.length + idx;
        ffmpegArgs.push('-loop', '1', '-t', ec.duration.toString(), '-i', ec.imagePath);
      });

      // Add background music track input(s)
      const trackInputIndex = 2 + inVideoOverlays.length + activeEndCards.length;
      if (resolvedAudioTracks.length > 0) {
        resolvedAudioTracks.forEach(t => {
          ffmpegArgs.push('-i', t.audioPath);
        });
      }

      let vFilter = '';
      if (hasEndCard) {
        const { endSlidesFilters, concatLabels } = buildEndCardFilters(activeEndCards);

        vFilter = `${vFilterRaw};[v0_raw]fps=30,setsar=1[v0];` +
          endSlidesFilters +
          `${concatLabels}concat=n=${1 + activeEndCards.length}:v=1:a=0[vcat];` +
          `[vcat]subtitles=${relativeAss}[vout]`;
      } else {
        vFilter = `${vFilterRaw};[v0_raw]subtitles=${relativeAss}[vout]`;
      }

      const voiceAudioInput = hasEndCard ? `[1:a]apad=pad_dur=${totalEndCardDuration}[voice]` : `[1:a]volume=1.0[voice]`;
      const { filterString: audioFilterStr, audioMap } = buildAudioFilterGraph({
        resolvedAudioTracks,
        trackStartIndex: trackInputIndex,
        totalDuration,
        origAudioMode,
        targetHasAudio,
        bgmVolume: 0.22,
        voiceInputLabel: '[voice]',
        includeBeat
      });

      ffmpegArgs.push(
        '-filter_complex', `${vFilter};${voiceAudioInput};${audioFilterStr}`,
        '-map', '[vout]',
        '-map', '[aout]',
        '-t', totalDuration.toString(),
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputPath
      );
    } else {
      const vFilter = `[1:v]drawgrid=w=120:h=120:t=2:c=red@0.15,` +
                      `drawbox=x=440:y=860:w=200:h=200:c=0x00A5FF@0.4:t=3,` +
                      `drawbox=x=539:y=800:w=2:h=320:c=0x00A5FF@0.6:t=fill,` +
                      `drawbox=x=380:y=959:w=320:h=2:c=0x00A5FF@0.6:t=fill,` +
                      `subtitles=${relativeAss}[vout]`;

      const aFilter = `aevalsrc=sin(2*PI*55*t)*exp(-4*mod(t\\,0.5)):s=44100:d=${duration}[beat];` +
                      `[0:a]volume=1.0[voice];[beat]volume=0.18[music];[voice][music]amix=inputs=2:duration=first[aout]`;

      ffmpegArgs = [
        '-y',
        '-i', voiceWav,
        '-f', 'lavfi', '-i', `color=c=0x0b0c10:s=1080x1920:d=${duration}`,
        '-filter_complex', `${vFilter};${aFilter}`,
        '-map', '[vout]',
        '-map', '[aout]',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputPath
      ];
    }

    console.log(`Auto-generating complete video: ${outputFile}...`);
    const proc = spawn(ffmpegPath, ffmpegArgs, { cwd: __dirname });
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());

    proc.on('close', code => {
      try { fs.unlinkSync(assFile); } catch (e) {}
      try { fs.unlinkSync(voiceWav); } catch (e) {}

      if (code === 0 && fs.existsSync(outputPath)) {
        console.log(`Auto video successfully created: ${outputFile}`);
        return res.json({
          success: true,
          outputUrl: `/output/${outputFile}`,
          filename: outputFile,
          duration: Math.round(totalDuration * 10) / 10,
          hasEndCard,
          scriptText: rawText
        });
      } else {
        console.error('Auto render failed:', stderr);
        return res.status(500).json({ error: 'Auto video rendering failed', details: stderr.slice(-300) });
      }
    });

  } catch (err) {
    console.error('Auto-create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 TikTok Creator Suite running at: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
