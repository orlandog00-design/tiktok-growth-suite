// Vercel Serverless Function: Trend Radar (Verified Warzone Season 6 Meta & News)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const category = (req.query && req.query.category) || (req.body && req.body.category) || 'all';

  // Verified S-Tier Season 6 Meta Pool
  const s6Gaming = [
    {
      id: 's6-voyak-1',
      category: 'gaming',
      title: 'The S-Tier Voyak KT-3 Build Dominating Warzone Season 6',
      velocity: '🔥 7.8M Views/Day',
      velocityType: 'viral',
      growth: '+820% this week',
      freshness: '🔴 LIVE • S6 Meta',
      hookPattern: 'Laser Beam / Season 6 Recoil Buff',
      recommendedAudio: 'Brazilian Phonk (136 BPM) / Fast Drift',
      audioId: 'phonk_drift',
      tiktokAudioQuery: 'Brazilian Phonk Fast Drift',
      hashtags: ['#voyakkt3', '#warzone', '#warzonemeta', '#season6', '#rebirthisland'],
      promptIdea: 'The absolute S-tier Voyak KT-3 assault rifle class with -8% recoil dominating Warzone Season 6.'
    },
    {
      id: 's6-vmp-2',
      category: 'gaming',
      title: 'The Broken Season 6 VMP Build Wiping Rebirth Island in 400ms',
      velocity: '🔥 8.4M Views/Day',
      velocityType: 'viral',
      growth: '+740% this week',
      freshness: '🔴 LIVE • S6 Meta',
      hookPattern: 'Fastest TTK / Room-Clearing SMG',
      recommendedAudio: 'Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)',
      audioId: 'dark_808_drill',
      tiktokAudioQuery: 'Dark 808 Drill Warzone Montage',
      hashtags: ['#vmp', '#vmploadout', '#warzoneclips', '#season6meta', '#rebirth'],
      promptIdea: 'The broken S-tier VMP SMG loadout in Warzone Season 6 that melts enemies in 400ms.'
    },
    {
      id: 's6-mpc25-3',
      category: 'gaming',
      title: 'The Zero-Recoil MPC-25 Setup Taking Over Ranked Resurgence',
      velocity: '🚀 6.1M Views/Day',
      velocityType: 'breakout',
      growth: '+590% this week',
      freshness: '⚡ SURGING • S6 Meta',
      hookPattern: 'Laser Steady / Max Mobility',
      recommendedAudio: 'Sigma 808 Cinematic Drop (128 BPM - 1v4 Clutch)',
      audioId: 'sigma_drop',
      tiktokAudioQuery: 'Sigma 808 Drop Warzone Clutch',
      hashtags: ['#mpc25', '#warzonebuilds', '#rankedresurgence', '#season6', '#codmeta'],
      promptIdea: 'The zero-recoil MPC-25 SMG build taking over Warzone Season 6 Ranked Resurgence.'
    },
    {
      id: 's6-strider-4',
      category: 'gaming',
      title: 'The 1-Shot Strider 300 Sniper Class Season 6 Pros Secretly Run',
      velocity: '🔥 6.9M Views/Day',
      velocityType: 'viral',
      growth: '+650% this week',
      freshness: '🔴 LIVE • S6 Meta',
      hookPattern: '1-Shot Down / Max Bullet Velocity',
      recommendedAudio: 'Montage Distortion Guitar (142 BPM - Sniper Headshots)',
      audioId: 'guitar_montage',
      tiktokAudioQuery: 'Distortion Guitar Rock Phonk',
      hashtags: ['#strider300', '#warzonesniper', '#oneshotsniper', '#season6', '#quickscope'],
      promptIdea: 'The fastest ADS 1-shot Strider 300 sniper class dominating Warzone Season 6.'
    },
    {
      id: 's6-mirage-5',
      category: 'gaming',
      title: 'The Season 6 DS20 Mirage Setup With Literally Zero Screen Shake',
      velocity: '🚀 5.2M Views/Day',
      velocityType: 'breakout',
      growth: '+480% this week',
      freshness: '⚡ SURGING • S6 Meta',
      hookPattern: 'Zero Bounce / Sniper Support',
      recommendedAudio: 'Cyber Combat Rush (148 BPM - Fast Adrenaline)',
      audioId: 'cyber_rush',
      tiktokAudioQuery: 'Cyber Rush Fast Electronic Bass',
      hashtags: ['#ds20mirage', '#warzoneloadout', '#season6meta', '#codwarzone'],
      promptIdea: 'The ultra-stable DS20 Mirage assault rifle build with zero screen shake in Warzone Season 6.'
    },
    {
      id: 's6-audio-6',
      category: 'gaming',
      title: "Turn ON 'Headphones Bass Boost' for Legal Footstep Audio Wallhacks",
      velocity: '⚡ 6.5M Views/Day',
      velocityType: 'hot',
      growth: '+530% this week',
      freshness: '🔴 LIVE • S6 Meta',
      hookPattern: 'Footstep Amplification / Audio EQ Setting',
      recommendedAudio: 'Slowed + Reverb Phonk (115 BPM - Aesthetic Vibe)',
      audioId: 'slowed_reverb_phonk',
      tiktokAudioQuery: 'Slowed Reverb Phonk Drift',
      hashtags: ['#warzoneaudiosettings', '#footsteps', '#warzonetips', '#season6', '#codsettings'],
      promptIdea: 'The secret Headphones Bass Boost and Windows Loudness EQ audio settings that make enemy footsteps 10x louder in Warzone Season 6.'
    }
  ];

  const faceless = [
    {
      category: "mystery",
      title: "The Unsolved 1974 Broadcast Hijacking Nobody Can Explain",
      velocity: '🔥 5.8M Views/Day',
      velocityType: 'viral',
      growth: "+690% this week",
      freshness: "🔴 LIVE • Mystery",
      hookPattern: "Unexplained Historical Mystery",
      recommendedAudio: "Suspense Countdown & Drop (130 BPM - Secret Class Reveal)",
      audioId: "suspense_drop",
      tiktokAudioQuery: "Horror Drone Suspense Ticking Clock",
      hashtags: ["#creepy", "#unsolvedmysteries", "#darkhistory", "#scaryfacts"],
      promptIdea: "Explain the chilling unsolved 1974 television broadcast hijacking in 45 seconds."
    },
    {
      category: "tech",
      title: "3 AI Websites That Feel Completely Illegal to Know in 2026",
      velocity: '🚀 6.4M Views/Day',
      velocityType: 'breakout',
      growth: "+720% this week",
      freshness: "⚡ SURGING • AI Tech",
      hookPattern: "Gatekept Tools / Secret Shortcut",
      recommendedAudio: "Cyber Combat Rush (148 BPM - Fast Adrenaline)",
      audioId: "cyber_rush",
      tiktokAudioQuery: "Future Synth Electronic Cyber",
      hashtags: ["#aiwebsites", "#productivity", "#aitools", "#techhacks"],
      promptIdea: "Reveal 3 free AI web apps that automate everyday digital tasks in seconds."
    },
    {
      category: "storytelling",
      title: "A Reddit Confession That Exposed a $4M Scam In 24 Hours",
      velocity: '🔥 4.9M Views/Day',
      velocityType: 'viral',
      growth: "+510% this week",
      freshness: "🔴 LIVE • Reddit Drama",
      hookPattern: "Viral Drama & Revenge",
      recommendedAudio: "Bouncy 808 Trap (132 BPM - Meta Recoil & Commentary)",
      audioId: "bouncy_trap",
      tiktokAudioQuery: "Bouncy 808 Trap Beat Storytime",
      hashtags: ["#redditstories", "#confessions", "#storytime", "#drama"],
      promptIdea: "A gripping retelling of an anonymous Reddit confession that exposed a massive corporate secret."
    }
  ];

  let pool = [...s6Gaming, ...faceless];
  if (category === 'gaming') pool = s6Gaming;
  else if (category === 'mystery' || category === 'storytelling' || category === 'tech') {
    pool = faceless.filter(f => f.category === category);
  }

  return res.json(pool);
};
