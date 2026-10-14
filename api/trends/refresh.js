// Vercel Serverless Function: Trend Refresh Engine (Gemini AI + Warzone Season 6 Meta)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category = 'all', apiKey, model = 'gemini-1.5-flash' } = req.body || {};

  // If user provided a Gemini API Key, try live AI generation with Season 6 ground truth
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const cleanModel = model.replace(/^models\//, '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;

      const systemPrompt = `You are an elite viral trend intelligence system monitoring TikTok, YouTube Shorts, and Call of Duty Warzone Season 6 algorithms.
Generate 6 REAL-TIME, high-velocity breakout viral trends right now for category: "${category}".

CRITICAL ACCURACY GUARDRAIL:
The current active game is strictly Warzone SEASON 6.
The verified S-Tier meta weapons right now are:
- Voyak KT-3 (#1 S-Tier Assault Rifle with -8% recoil buff)
- VMP (#1 S-Tier Close-Range SMG with fastest TTK)
- MPC-25 (S-Tier steady SMG)
- Strider 300 (S-Tier 1-shot sniper)
- DS20 Mirage (S-Tier zero-screen-shake support AR)
- Ryden 45K (Max mobility pocket rocket SMG)
- TR51 Para (Long range laser AR)
DO NOT mention outdated past seasons (Season 1 to 5) or obsolete weapons (C9, Krig C, Model L, Jackal PDW, Superi).

Output MUST strictly be a JSON object:
{
  "trends": [
    {
      "id": "gemini-trend-1",
      "category": "${category}",
      "title": "...",
      "velocity": "🔥 7.8M Views/Day",
      "velocityType": "viral",
      "growth": "+820% this week",
      "freshness": "🔴 LIVE • Just now",
      "hookPattern": "...",
      "recommendedAudio": "Brazilian Phonk (136 BPM) / Fast Drift",
      "audioId": "phonk_drift",
      "tiktokAudioQuery": "Brazilian Phonk Fast Drift",
      "hashtags": ["#voyakkt3", "#warzone", "#season6"],
      "promptIdea": "..."
    }
  ]
}`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nScan and return the 6 most viral, high-velocity trends and viral audio styles right now.` }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      };

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.trends) && parsed.trends.length > 0) {
            return res.json({ source: 'gemini', trends: parsed.trends });
          }
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini refresh failed, falling back to dynamic generator:', geminiErr.message);
    }
  }

  // Dynamic Season 6 Trend Generator (Instant, 100% reliable fallback)
  const dynamicTrends = getFreshDynamicTrends(category);
  return res.json({
    source: 'dynamic',
    trends: dynamicTrends
  });
};

function getFreshDynamicTrends(category = 'all') {
  const minsAgo = Math.floor(Math.random() * 5) + 1;
  const gamingPool = [
    {
      id: `s6-voyak-${Date.now()}-1`,
      category: 'gaming',
      title: 'The S-Tier Voyak KT-3 Build Dominating Warzone Season 6',
      velocity: `🔥 ${(7.5 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'viral',
      growth: `+${Math.floor(780 + Math.random() * 60)}% this week`,
      freshness: `🔴 LIVE • ${minsAgo}m ago`,
      hookPattern: 'Laser Beam / Season 6 Recoil Buff',
      recommendedAudio: 'Brazilian Phonk (136 BPM) / Fast Drift',
      audioId: 'phonk_drift',
      tiktokAudioQuery: 'Brazilian Phonk Fast Drift',
      hashtags: ['#voyakkt3', '#warzone', '#warzonemeta', '#season6', '#rebirthisland'],
      promptIdea: 'The absolute S-tier Voyak KT-3 assault rifle class with -8% recoil dominating Warzone Season 6.'
    },
    {
      id: `s6-vmp-${Date.now()}-2`,
      category: 'gaming',
      title: 'The Broken Season 6 VMP Build Wiping Rebirth Island in 400ms',
      velocity: `🔥 ${(8.1 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'viral',
      growth: `+${Math.floor(700 + Math.random() * 80)}% this week`,
      freshness: `🔴 LIVE • ${minsAgo}m ago`,
      hookPattern: 'Fastest TTK / Room-Clearing SMG',
      recommendedAudio: 'Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)',
      audioId: 'dark_808_drill',
      tiktokAudioQuery: 'Dark 808 Drill Warzone Montage',
      hashtags: ['#vmp', '#vmploadout', '#warzoneclips', '#season6meta', '#rebirth'],
      promptIdea: 'The broken S-tier VMP SMG loadout in Warzone Season 6 that melts enemies in 400ms.'
    },
    {
      id: `s6-mpc25-${Date.now()}-3`,
      category: 'gaming',
      title: 'The Zero-Recoil MPC-25 Setup Taking Over Ranked Resurgence',
      velocity: `🚀 ${(5.8 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'breakout',
      growth: `+${Math.floor(550 + Math.random() * 70)}% this week`,
      freshness: `⚡ SURGING • ${minsAgo + 3}m ago`,
      hookPattern: 'Laser Steady / Max Mobility',
      recommendedAudio: 'Sigma 808 Cinematic Drop (128 BPM - 1v4 Clutch)',
      audioId: 'sigma_drop',
      tiktokAudioQuery: 'Sigma 808 Drop Warzone Clutch',
      hashtags: ['#mpc25', '#warzonebuilds', '#rankedresurgence', '#season6', '#codmeta'],
      promptIdea: 'The zero-recoil MPC-25 SMG build taking over Warzone Season 6 Ranked Resurgence.'
    },
    {
      id: `s6-strider-${Date.now()}-4`,
      category: 'gaming',
      title: 'The 1-Shot Strider 300 Sniper Class Season 6 Pros Secretly Run',
      velocity: `🔥 ${(6.6 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'viral',
      growth: `+${Math.floor(620 + Math.random() * 60)}% this week`,
      freshness: `🔴 LIVE • ${minsAgo + 1}m ago`,
      hookPattern: '1-Shot Down / Max Bullet Velocity',
      recommendedAudio: 'Montage Distortion Guitar (142 BPM - Sniper Headshots)',
      audioId: 'guitar_montage',
      tiktokAudioQuery: 'Distortion Guitar Rock Phonk',
      hashtags: ['#strider300', '#warzonesniper', '#oneshotsniper', '#season6', '#quickscope'],
      promptIdea: 'The fastest ADS 1-shot Strider 300 sniper class dominating Warzone Season 6.'
    },
    {
      id: `s6-mirage-${Date.now()}-5`,
      category: 'gaming',
      title: 'The Season 6 DS20 Mirage Setup With Literally Zero Screen Shake',
      velocity: `🚀 ${(5.0 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'breakout',
      growth: `+${Math.floor(460 + Math.random() * 50)}% this week`,
      freshness: `⚡ SURGING • ${minsAgo + 4}m ago`,
      hookPattern: 'Zero Bounce / Sniper Support',
      recommendedAudio: 'Cyber Combat Rush (148 BPM - Fast Adrenaline)',
      audioId: 'cyber_rush',
      tiktokAudioQuery: 'Cyber Rush Fast Electronic Bass',
      hashtags: ['#ds20mirage', '#warzoneloadout', '#season6meta', '#codwarzone'],
      promptIdea: 'The ultra-stable DS20 Mirage assault rifle build with zero screen shake in Warzone Season 6.'
    },
    {
      id: `s6-audio-${Date.now()}-6`,
      category: 'gaming',
      title: "Turn ON 'Headphones Bass Boost' for Legal Footstep Audio Wallhacks",
      velocity: `⚡ ${(6.2 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'hot',
      growth: `+${Math.floor(510 + Math.random() * 50)}% this week`,
      freshness: `🔴 LIVE • ${minsAgo}m ago`,
      hookPattern: 'Footstep Amplification / Audio EQ Setting',
      recommendedAudio: 'Slowed + Reverb Phonk (115 BPM - Aesthetic Vibe)',
      audioId: 'slowed_reverb_phonk',
      tiktokAudioQuery: 'Slowed Reverb Phonk Drift',
      hashtags: ['#warzoneaudiosettings', '#footsteps', '#warzonetips', '#season6', '#codsettings'],
      promptIdea: 'The secret Headphones Bass Boost and Windows Loudness EQ audio settings that make enemy footsteps 10x louder in Warzone Season 6.'
    }
  ];

  const facelessPool = [
    {
      id: `face-mystery-${Date.now()}`,
      category: "mystery",
      title: "The Unsolved 1974 Broadcast Hijacking Nobody Can Explain",
      velocity: `🔥 ${(5.6 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'viral',
      growth: "+690% this week",
      freshness: `🔴 LIVE • ${minsAgo}m ago`,
      hookPattern: "Unexplained Historical Mystery",
      recommendedAudio: "Suspense Countdown & Drop (130 BPM - Secret Class Reveal)",
      audioId: "suspense_drop",
      tiktokAudioQuery: "Horror Drone Suspense Ticking Clock",
      hashtags: ["#creepy", "#unsolvedmysteries", "#darkhistory", "#scaryfacts"],
      promptIdea: "Explain the chilling unsolved 1974 television broadcast hijacking in 45 seconds."
    },
    {
      id: `face-tech-${Date.now()}`,
      category: "tech",
      title: "3 AI Websites That Feel Completely Illegal to Know in 2026",
      velocity: `🚀 ${(6.3 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'breakout',
      growth: "+720% this week",
      freshness: `⚡ SURGING • ${minsAgo + 2}m ago`,
      hookPattern: "Gatekept Tools / Secret Shortcut",
      recommendedAudio: "Cyber Combat Rush (148 BPM - Fast Adrenaline)",
      audioId: "cyber_rush",
      tiktokAudioQuery: "Future Synth Electronic Cyber",
      hashtags: ["#aiwebsites", "#productivity", "#aitools", "#techhacks"],
      promptIdea: "Reveal 3 free AI web apps that automate everyday digital tasks in seconds."
    },
    {
      id: `face-story-${Date.now()}`,
      category: "storytelling",
      title: "A Reddit Confession That Exposed a $4M Scam In 24 Hours",
      velocity: `🔥 ${(4.8 + Math.random()).toFixed(1)}M Views/Day`,
      velocityType: 'viral',
      growth: "+510% this week",
      freshness: `🔴 LIVE • ${minsAgo}m ago`,
      hookPattern: "Viral Drama & Revenge",
      recommendedAudio: "Bouncy 808 Trap (132 BPM - Meta Recoil & Commentary)",
      audioId: "bouncy_trap",
      tiktokAudioQuery: "Bouncy 808 Trap Beat Storytime",
      hashtags: ["#redditstories", "#confessions", "#storytime", "#drama"],
      promptIdea: "A gripping retelling of an anonymous Reddit confession that exposed a massive corporate secret."
    }
  ];

  if (category === 'gaming') return gamingPool;
  if (category === 'mystery' || category === 'storytelling' || category === 'tech') {
    return facelessPool.filter(f => f.category === category);
  }
  return [...gamingPool, ...facelessPool];
}
