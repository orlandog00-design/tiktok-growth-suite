// Vercel Serverless Function: Trend Refresh & Search Engine (Gemini AI + Warzone Season 6 / Topic Search)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category = 'all', topic = '', apiKey, model = 'gemini-1.5-flash' } = req.body || {};
  const cleanTopic = (topic || '').trim();

  // If user provided a Gemini API Key, try live AI generation with custom topic intelligence
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const cleanModel = model.replace(/^models\//, '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;

      let systemPrompt = '';
      if (cleanTopic) {
        const isWarzone = /warzone|cod|call of duty/i.test(cleanTopic);
        systemPrompt = `You are an elite viral trend intelligence system monitoring TikTok, YouTube Shorts, and gaming algorithms.
Generate 6 REAL-TIME, high-velocity breakout viral trends right now for topic / game: "${cleanTopic}".
Focus on current meta, game strategies, breakout viral debate hooks, secret settings, and high-retention frameworks for "${cleanTopic}".
${isWarzone ? 'CRITICAL: The current active game is strictly Warzone SEASON 6 (S-Tier weapons: Voyak KT-3, VMP, MPC-25, Strider 300, DS20 Mirage). DO NOT mention outdated weapons (C9, Krig C, Model L, Jackal PDW).' : ''}`;
      } else {
        systemPrompt = `You are an elite viral trend intelligence system monitoring TikTok, YouTube Shorts, and Call of Duty Warzone Season 6 algorithms.
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
DO NOT mention outdated past seasons (Season 1 to 5) or obsolete weapons (C9, Krig C, Model L, Jackal PDW, Superi).`;
      }

      systemPrompt += `\nEnsure every trend has:
- Hyper-specific topic title
- Real viral velocity (e.g. "🔥 8.4M Views/Day")
- velocityType: "viral", "breakout", or "hot"
- growth: "+720% this week"
- freshness: "🔴 LIVE • Just now"
- hookPattern: exact hook framework
- recommendedAudio: specific audio title, BPM, and sound mood
- audioId: one of ["phonk_drift", "dark_808_drill", "guitar_montage", "sigma_drop", "hyper_hardstyle", "slowed_reverb_phonk", "cyber_rush", "suspense_drop", "bouncy_trap", "lofi_gunsmith"]
- tiktokAudioQuery: search term to find this sound on TikTok
- hashtags: 4-6 hashtags
- promptIdea: 1-sentence prompt

Output MUST strictly be a JSON object:
{
  "trends": [
    {
      "id": "gemini-trend-1",
      "category": "${category}",
      "title": "...",
      "velocity": "🔥 8.4M Views/Day",
      "velocityType": "viral",
      "growth": "+820% this week",
      "freshness": "🔴 LIVE • Just now",
      "hookPattern": "...",
      "recommendedAudio": "Brazilian Phonk (136 BPM) / Fast Drift",
      "audioId": "phonk_drift",
      "tiktokAudioQuery": "Brazilian Phonk Fast Drift",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "promptIdea": "..."
    }
  ]
}`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nScan and return the 6 most viral, high-velocity trends and viral audio styles right now for: "${cleanTopic || category}".` }] }],
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
            return res.json({ source: 'gemini', topic: cleanTopic, trends: parsed.trends });
          }
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini refresh failed, falling back to dynamic generator:', geminiErr.message);
    }
  }

  // Dynamic Season 6 / Topic Search Trend Generator (Instant, 100% reliable fallback)
  const dynamicTrends = getFreshDynamicTrends(category, cleanTopic);
  return res.json({
    source: cleanTopic ? 'topic-search' : 'dynamic',
    topic: cleanTopic,
    trends: dynamicTrends
  });
};

function getFreshDynamicTrends(category = 'all', topic = '') {
  const minsAgo = Math.floor(Math.random() * 4) + 1;
  const kw = (topic || '').trim().toLowerCase();

  // 1. FORTNITE DEDICATED BREAKOUT SUITE
  if (kw.includes('fortnite')) {
    return [
      {
        id: `fn-striker-${Date.now()}-1`,
        category: 'gaming',
        title: 'The Broken S-Tier Striker AR Setup Dominating Ranked Zero Build',
        velocity: `🔥 ${(8.8 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+940% this week',
        freshness: `🔴 LIVE • Fortnite Meta`,
        hookPattern: 'Fastest TTK / Zero Build Laser',
        recommendedAudio: 'Brazilian Phonk (136 BPM) / Fast Drift',
        audioId: 'phonk_drift',
        tiktokAudioQuery: 'Brazilian Phonk Fortnite Clips',
        hashtags: ['#fortnite', '#fortnitemeta', '#zerobuild', '#fortniteranked', '#chapter5'],
        promptIdea: 'The broken Striker AR loadout wiping squads in Fortnite Ranked Zero Build with zero recoil.'
      },
      {
        id: `fn-audio-${Date.now()}-2`,
        category: 'gaming',
        title: "Turn ON 'Visualize Sound Effects' for In-Game Wallhack Audio in Fortnite",
        velocity: `🔥 ${(9.2 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+870% this week',
        freshness: `🔴 LIVE • Pro Setting`,
        hookPattern: 'Settings Exploit / Visual Footsteps',
        recommendedAudio: 'Suspense Countdown & Drop (130 BPM - Secret Class Reveal)',
        audioId: 'suspense_drop',
        tiktokAudioQuery: 'Fortnite Sound Effects Setting Trick',
        hashtags: ['#fortnitesettings', '#fortnitetips', '#visualizesound', '#fortnitepro', '#foryou'],
        promptIdea: 'The secret Visualize Sound Effects setting in Fortnite that reveals enemy footsteps 50 meters away through walls.'
      },
      {
        id: `fn-loot-${Date.now()}-3`,
        category: 'gaming',
        title: 'How to Get 100% Guaranteed Mythic Loot in Chapter 5 with Zero Fighting',
        velocity: `🚀 ${(7.5 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'breakout',
        growth: '+710% this week',
        freshness: `⚡ SURGING • Chapter 5`,
        hookPattern: 'Secret Landing Route / Free Vault',
        recommendedAudio: 'Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)',
        audioId: 'dark_808_drill',
        tiktokAudioQuery: 'Dark 808 Drill Fortnite Montage',
        hashtags: ['#fortniteloot', '#fortnitemythic', '#fortniteglitch', '#rankedfortnite'],
        promptIdea: 'The uncontested Fortnite landing spot that gives you full shields and gold mythics in 60 seconds.'
      },
      {
        id: `fn-move-${Date.now()}-4`,
        category: 'gaming',
        title: 'The Undetected Slide-Kick Movement Technique Breaking Enemy Hitboxes',
        velocity: `🔥 ${(8.1 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+680% this week',
        freshness: `🔴 LIVE • Movement God`,
        hookPattern: 'Camera Break / Hitbox Evasion',
        recommendedAudio: 'Hyper-Drive Hardstyle (150 BPM - Camera Breaker)',
        audioId: 'hyper_hardstyle',
        tiktokAudioQuery: 'Hardstyle Tevvez Fortnite Movement',
        hashtags: ['#fortnitemovement', '#fortniteslidetrick', '#fortniteclips', '#movementgod'],
        promptIdea: 'How to break enemy crosshairs using the new sprint-slide jump cancel in Fortnite.'
      },
      {
        id: `fn-sniper-${Date.now()}-5`,
        category: 'gaming',
        title: 'The 1-Shot Heavy Sniper Trick Fortnite Pros Secretly Use to Open Vaults',
        velocity: `🚀 ${(6.8 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'breakout',
        growth: '+620% this week',
        freshness: `⚡ SURGING • Pro Secret`,
        hookPattern: '1-Shot Mechanism / Quick Wall Break',
        recommendedAudio: 'Montage Distortion Guitar (142 BPM - Sniper Headshots)',
        audioId: 'guitar_montage',
        tiktokAudioQuery: 'Distortion Guitar Rock Phonk Fortnite',
        hashtags: ['#fortnitesniper', '#oneshot', '#fortniteprosecret', '#fortnite'],
        promptIdea: 'The secret heavy sniper trick that instantly deletes builds and cracks shields in Fortnite.'
      },
      {
        id: `fn-rank-${Date.now()}-6`,
        category: 'gaming',
        title: 'The Fastest Way to Reach Unreal Rank in Fortnite Solo (Zero Build)',
        velocity: `⚡ ${(7.8 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'hot',
        growth: '+750% this week',
        freshness: `🔴 LIVE • Ranked Guide`,
        hookPattern: 'Ranked Climb Formula / Placement Points',
        recommendedAudio: 'Sigma 808 Cinematic Drop (128 BPM - 1v4 Clutch)',
        audioId: 'sigma_drop',
        tiktokAudioQuery: 'Sigma 808 Drop Fortnite Ranked Clutch',
        hashtags: ['#fortniteunreal', '#rankedtips', '#zerobuildranked', '#fortnitegameplay'],
        promptIdea: 'The exact placement and rotation strategy to climb from Diamond to Unreal in Fortnite Solo.'
      }
    ];
  }

  // 1.5 ROBLOX DEDICATED BREAKOUT SUITE
  if (kw.includes('roblox')) {
    return [
      {
        id: `rbx-dress-${Date.now()}-1`,
        category: 'gaming',
        title: 'The Secret Dress to Impress Speed Glitch Winning Every Master Server',
        velocity: `🔥 ${(9.4 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+920% this week',
        freshness: '🔴 LIVE • Roblox Meta',
        hookPattern: 'Glitch / Guaranteed Win Formula',
        recommendedAudio: 'Brazilian Phonk (136 BPM) / Fast Drift',
        audioId: 'phonk_drift',
        tiktokAudioQuery: 'Brazilian Phonk Roblox Speed',
        hashtags: ['#roblox', '#dresstoimpress', '#dti', '#robloxtips', '#robloxglitch'],
        promptIdea: 'The secret Dress to Impress outfit stacking glitch that guarantees 5 stars on master servers.'
      },
      {
        id: `rbx-blox-${Date.now()}-2`,
        category: 'gaming',
        title: 'Top 3 Working Blox Fruits PvP Combos That 1-Shot Bounty Hunters in Update 24',
        velocity: `🔥 ${(8.9 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+860% this week',
        freshness: '🔴 LIVE • Update 24',
        hookPattern: '1-Shot Combo / Bounty Hunt',
        recommendedAudio: 'Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)',
        audioId: 'dark_808_drill',
        tiktokAudioQuery: 'Dark 808 Drill Blox Fruits PvP',
        hashtags: ['#bloxfruits', '#robloxpvp', '#bloxfruitspvp', '#bountyhunting'],
        promptIdea: 'The 3 uncounterable Blox Fruits fruit-and-sword combos that 1-shot max level players.'
      },
      {
        id: `rbx-horror-${Date.now()}-3`,
        category: 'gaming',
        title: 'The Most Terrifying Roblox Horror Game of 2026 That Got Secretly Banned',
        velocity: `🚀 ${(8.2 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'breakout',
        growth: '+790% this week',
        freshness: '⚡ SURGING • Horror',
        hookPattern: 'Cursed Game / Creepypasta Mystery',
        recommendedAudio: 'Suspense Countdown & Drop (130 BPM - Secret Class Reveal)',
        audioId: 'suspense_drop',
        tiktokAudioQuery: 'Roblox Scary Ambient Drone',
        hashtags: ['#robloxhorror', '#scaryroblox', '#robloxfacts', '#creepyroblox'],
        promptIdea: 'Do not play this hidden Roblox horror game at 3 AM unless you want nightmares for weeks.'
      },
      {
        id: `rbx-doors-${Date.now()}-4`,
        category: 'gaming',
        title: 'The Hidden Secret in Doors Floor 2 That Nobody Has Figured Out Yet',
        velocity: `🔥 ${(7.7 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+710% this week',
        freshness: '🔴 LIVE • Doors Mystery',
        hookPattern: 'Secret Room / Easter Egg',
        recommendedAudio: 'Sigma 808 Cinematic Drop (128 BPM - 1v4 Clutch)',
        audioId: 'sigma_drop',
        tiktokAudioQuery: 'Sigma 808 Drop Doors Roblox',
        hashtags: ['#doorsroblox', '#doorsfloor2', '#robloxdoors', '#robloxsecrets'],
        promptIdea: 'The secret puzzle hidden behind Room 150 in Doors Floor 2 that developers thought nobody would find.'
      },
      {
        id: `rbx-robux-${Date.now()}-5`,
        category: 'gaming',
        title: 'How to Earn 50,000 Free Robux Legitimately Through Creator Marketplace',
        velocity: `🚀 ${(8.5 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'breakout',
        growth: '+830% this week',
        freshness: '⚡ SURGING • Creator Tips',
        hookPattern: 'Value Leak / Safe Legit Method',
        recommendedAudio: 'Bouncy 808 Trap (132 BPM - Meta Recoil & Commentary)',
        audioId: 'bouncy_trap',
        tiktokAudioQuery: 'Bouncy 808 Trap Roblox UGC',
        hashtags: ['#freerobux', '#robloxugc', '#robloxcreator', '#robloxhacks'],
        promptIdea: 'Stop falling for fake Robux scams—here is the exact UGC catalog method that made me 50K Robux.'
      },
      {
        id: `rbx-audio-${Date.now()}-6`,
        category: 'gaming',
        title: 'The 150 BPM Hardstyle Audio Dominating Roblox Speed Montages',
        velocity: `⚡ ${(8.8 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'hot',
        growth: '+740% this week',
        freshness: '🔴 LIVE • Viral Beat',
        hookPattern: 'Speed Edit / Adrenaline Surge',
        recommendedAudio: 'Hyper-Drive Hardstyle (150 BPM - Camera Breaker)',
        audioId: 'hyper_hardstyle',
        tiktokAudioQuery: 'Hardstyle Tevvez Roblox Speed Edit',
        hashtags: ['#robloxedit', '#robloxmontage', '#hardstyle', '#speedrunroblox'],
        promptIdea: 'Why this 150 BPM hardstyle kick sound increases TikTok completion rate on Roblox clips by 400%.'
      }
    ];
  }

  // 1.8 CALL OF DUTY MULTIPLAYER DEDICATED BREAKOUT SUITE
  if (kw.includes('multiplayer') || kw.includes('mp') || kw.includes('cod multiplayer')) {
    return [
      {
        id: `codmp-jackal-${Date.now()}-1`,
        category: 'gaming',
        title: 'The S-Tier Jackal PDW Build Dominating Ranked Multiplayer Search & Destroy',
        velocity: `🔥 ${(8.9 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+880% this week',
        freshness: '🔴 LIVE • Ranked MP Meta',
        hookPattern: 'Fastest TTK / Snaking Laser',
        recommendedAudio: 'Brazilian Phonk (136 BPM) / Fast Drift',
        audioId: 'phonk_drift',
        tiktokAudioQuery: 'Brazilian Phonk Ranked MP SnD',
        hashtags: ['#codmultiplayer', '#rankedplay', '#snd', '#callofduty', '#codmeta'],
        promptIdea: 'The banned-in-CDL Jackal PDW class setup melting ranked multiplayer lobbies in 3 bullets.'
      },
      {
        id: `codmp-nuke-${Date.now()}-2`,
        category: 'gaming',
        title: 'How to Drop a 30-Streak Nuke Every Game With This Spawn Trap Route',
        velocity: `🔥 ${(9.3 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+940% this week',
        freshness: '🔴 LIVE • Nuke Guide',
        hookPattern: 'Spawn Logic / Unstoppable Streak',
        recommendedAudio: 'Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)',
        audioId: 'dark_808_drill',
        tiktokAudioQuery: 'Dark 808 Drill COD Nuke Streak',
        hashtags: ['#codnuke', '#spawntrap', '#multiplayer', '#streak', '#callofduty'],
        promptIdea: 'The exact spawn manipulation route to guarantee a 30-kill streak nuke without camping.'
      },
      {
        id: `codmp-aim-${Date.now()}-3`,
        category: 'gaming',
        title: "Turn ON 'Dynamic Response Curve' & 0.05 Deadzones for Sticky Aim Assist",
        velocity: `⚡ ${(8.7 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'hot',
        growth: '+810% this week',
        freshness: '🔴 LIVE • Controller Setting',
        hookPattern: 'Controller Aimbot / Settings Exploit',
        recommendedAudio: 'Slowed + Reverb Phonk (115 BPM - Aesthetic Vibe)',
        audioId: 'slowed_reverb_phonk',
        tiktokAudioQuery: 'Slowed Reverb COD Aim Settings',
        hashtags: ['#codsettings', '#aimassist', '#controllerplayer', '#deadzone', '#codtips'],
        promptIdea: 'The secret controller response curve and rotational aim assist settings that make tracking impossible to break.'
      },
      {
        id: `codmp-snipe-${Date.now()}-4`,
        category: 'gaming',
        title: 'The Fastest ADS 1-Shot Sniper Setup Dominating Shipment and Meat',
        velocity: `🚀 ${(7.8 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'breakout',
        growth: '+690% this week',
        freshness: '⚡ SURGING • Small Maps',
        hookPattern: 'Instant ADS / Clip Machine',
        recommendedAudio: 'Montage Distortion Guitar (142 BPM - Sniper Headshots)',
        audioId: 'guitar_montage',
        tiktokAudioQuery: 'Distortion Guitar COD Quickscope Montage',
        hashtags: ['#quickscope', '#shipment', '#codsniping', '#headshots', '#feed'],
        promptIdea: 'The sub-200ms ADS sniper build that lets you hit effortless quad feeds on small maps.'
      },
      {
        id: `codmp-move-${Date.now()}-5`,
        category: 'gaming',
        title: 'The Omnimovement Slide-Cancel Setting for Instant Snaking Behind Headglitches',
        velocity: `🔥 ${(8.3 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: '+760% this week',
        freshness: '🔴 LIVE • Movement King',
        hookPattern: 'Omnimovement Exploit / Snaking',
        recommendedAudio: 'Hyper-Drive Hardstyle (150 BPM - Camera Breaker)',
        audioId: 'hyper_hardstyle',
        tiktokAudioQuery: 'Hardstyle COD Movement Demon',
        hashtags: ['#omnimovement', '#snaking', '#camerabreak', '#codmovement'],
        promptIdea: 'How to abuse omnimovement sprinting to become completely unhittable on headglitches.'
      },
      {
        id: `codmp-hardpoint-${Date.now()}-6`,
        category: 'gaming',
        title: 'The Hardpoint Trophy & Flak Setup That Pro Teams Secretly Gentleman-Banned',
        velocity: `🚀 ${(7.2 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'breakout',
        growth: '+630% this week',
        freshness: '⚡ SURGING • CDL Meta',
        hookPattern: 'Gentlemen Agreement / Banned Strat',
        recommendedAudio: 'Sigma 808 Cinematic Drop (128 BPM - 1v4 Clutch)',
        audioId: 'sigma_drop',
        tiktokAudioQuery: 'Sigma 808 Drop Ranked Hardpoint Clutch',
        hashtags: ['#hardpoint', '#cdl', '#ga', '#competitivecod', '#esports'],
        promptIdea: 'The hill-holding perk and tactical setup that makes breaking Hardpoints physically impossible.'
      }
    ];
  }

  // 2. MINECRAFT DEDICATED VIRAL SUITE
  if (kw.includes('minecraft')) {
    return [
      {
        id: `mc-hardcore-${Date.now()}-1`,
        category: 'gaming',
        title: 'The 100-Day Hardcore Survival Secret That Pro Speedrunners Keep Hidden',
        velocity: `🔥 7.9M Views/Day`,
        velocityType: 'viral',
        growth: '+810% this week',
        freshness: `🔴 LIVE • Minecraft`,
        hookPattern: 'Unsolved Secret / Speedrun Glitch',
        recommendedAudio: 'Suspense Countdown & Drop (130 BPM - Secret Class Reveal)',
        audioId: 'suspense_drop',
        tiktokAudioQuery: 'Minecraft Ambient Horror Drone Suspense',
        hashtags: ['#minecraft', '#minecrafthardcore', '#minecrafttips', '#speedrun'],
        promptIdea: 'The game-changing 100-day hardcore survival trick that prevents death from ancient city wardens.'
      },
      {
        id: `mc-farm-${Date.now()}-2`,
        category: 'gaming',
        title: 'This 1-Chunk Iron Farm Gives You 3,000 Ingots Per Hour in 1.21',
        velocity: `🚀 6.8M Views/Day`,
        velocityType: 'breakout',
        growth: '+690% this week',
        freshness: `⚡ SURGING • 1.21 Update`,
        hookPattern: 'High Efficiency Redstone / Infinite Farm',
        recommendedAudio: 'Brazilian Phonk (136 BPM) / Fast Drift',
        audioId: 'phonk_drift',
        tiktokAudioQuery: 'Brazilian Phonk Minecraft Timelapse',
        hashtags: ['#minecraftbuilds', '#minecraftfarm', '#redstone', '#minecraft121'],
        promptIdea: 'Build this microscopic 1-chunk iron farm in Minecraft 1.21 in under 10 minutes.'
      },
      {
        id: `mc-seed-${Date.now()}-3`,
        category: 'gaming',
        title: 'The Creepiest Unsolved Minecraft Seed Discovered in 12 Years',
        velocity: `🔥 8.4M Views/Day`,
        velocityType: 'viral',
        growth: '+760% this week',
        freshness: `🔴 LIVE • Mystery`,
        hookPattern: 'Chilling ARG Mystery / Cursed Seed',
        recommendedAudio: 'Suspense Countdown & Drop (130 BPM - Secret Class Reveal)',
        audioId: 'suspense_drop',
        tiktokAudioQuery: 'Scary Minecraft Seed Music',
        hashtags: ['#minecraftmystery', '#creepyseeds', '#cursedminecraft', '#arg'],
        promptIdea: 'The disturbing Minecraft seed that spawns an inverted bedrock cross and empty villages.'
      }
    ];
  }

  // 3. CUSTOM TOPIC SEARCH ADAPTIVE ENGINE (FOR ANY OTHER SEARCH TERM)
  if (kw.length > 0 && !kw.includes('warzone') && !kw.includes('cod')) {
    const cleanCap = topic.trim().charAt(0).toUpperCase() + topic.trim().slice(1);
    const tag = cleanCap.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    return [
      {
        id: `custom-${Date.now()}-1`,
        category: 'gaming',
        title: `The Breakout ${cleanCap} Strategy Taking Over TikTok Right Now`,
        velocity: `🔥 ${(7.6 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: `+${Math.floor(740 + Math.random() * 80)}% this week`,
        freshness: `🔴 LIVE • ${cleanCap}`,
        hookPattern: 'Contradiction / Pattern Interrupt',
        recommendedAudio: 'Brazilian Phonk (136 BPM) / Fast Drift',
        audioId: 'phonk_drift',
        tiktokAudioQuery: `Brazilian Phonk ${cleanCap} Montage`,
        hashtags: [`#${tag}`, `#${tag}clips`, '#viral', '#foryoupage', '#gamingontiktok'],
        promptIdea: `Stop doing this mistake with ${cleanCap} right now—here is the secret technique doubling view counts.`
      },
      {
        id: `custom-${Date.now()}-2`,
        category: 'gaming',
        title: `3 Secret ${cleanCap} Tricks That Feel Completely Illegal to Know`,
        velocity: `🚀 ${(6.8 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'breakout',
        growth: `+${Math.floor(620 + Math.random() * 70)}% this week`,
        freshness: `⚡ SURGING • ${cleanCap}`,
        hookPattern: 'Gatekept Secrets / Unfair Advantage',
        recommendedAudio: 'Cyber Combat Rush (148 BPM - Fast Adrenaline)',
        audioId: 'cyber_rush',
        tiktokAudioQuery: `Cyber Synth Electronic ${cleanCap}`,
        hashtags: [`#${tag}`, `#${tag}tips`, '#secrets', '#hacks', '#trending'],
        promptIdea: `3 unknown ${cleanCap} tips that give you an unfair advantage over 99% of people.`
      },
      {
        id: `custom-${Date.now()}-3`,
        category: 'gaming',
        title: `Turn ON This Hidden Setting in ${cleanCap} for Immediate Results`,
        velocity: `🔥 ${(8.1 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: `+${Math.floor(790 + Math.random() * 60)}% this week`,
        freshness: `🔴 LIVE • Pro Config`,
        hookPattern: 'Hidden Setting / High Optimization',
        recommendedAudio: 'Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)',
        audioId: 'dark_808_drill',
        tiktokAudioQuery: `Dark 808 Drill ${cleanCap}`,
        hashtags: [`#${tag}`, `#${tag}settings`, '#optimization', '#gaming'],
        promptIdea: `The single default setting in ${cleanCap} you must disable immediately.`
      },
      {
        id: `custom-${Date.now()}-4`,
        category: 'gaming',
        title: `The S-Tier ${cleanCap} Meta Build Dominating Every Lobby`,
        velocity: `⚡ ${(6.5 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'hot',
        growth: `+${Math.floor(580 + Math.random() * 50)}% this week`,
        freshness: `🔴 LIVE • Meta Alert`,
        hookPattern: 'Secret Nerf / S-Tier Class',
        recommendedAudio: 'Montage Distortion Guitar (142 BPM - Headshots)',
        audioId: 'guitar_montage',
        tiktokAudioQuery: `Distortion Guitar Phonk ${cleanCap}`,
        hashtags: [`#${tag}`, `#${tag}meta`, '#bestbuild', '#clips'],
        promptIdea: `The best ${cleanCap} setup right now that deletes opponents in milliseconds.`
      },
      {
        id: `custom-${Date.now()}-5`,
        category: 'gaming',
        title: `Watch How I Solved This Impossible ${cleanCap} Challenge`,
        velocity: `🚀 ${(5.9 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'breakout',
        growth: `+${Math.floor(520 + Math.random() * 50)}% this week`,
        freshness: `⚡ SURGING • Challenge`,
        hookPattern: 'Clutch / High Stakes Story',
        recommendedAudio: 'Sigma 808 Cinematic Drop (128 BPM - 1v4 Clutch)',
        audioId: 'sigma_drop',
        tiktokAudioQuery: `Sigma 808 Drop ${cleanCap}`,
        hashtags: [`#${tag}`, `#${tag}clutch`, '#challenge', '#insane'],
        promptIdea: `How I pulled off the most insane 1v4 clutch in ${cleanCap} with 1 HP remaining.`
      },
      {
        id: `custom-${Date.now()}-6`,
        category: 'gaming',
        title: `The 140 BPM Audio Meta That Quadrupled ${cleanCap} Watch Time`,
        velocity: `🔥 ${(7.2 + Math.random()).toFixed(1)}M Views/Day`,
        velocityType: 'viral',
        growth: `+${Math.floor(660 + Math.random() * 50)}% this week`,
        freshness: `🔴 LIVE • Algorithm Trick`,
        hookPattern: 'Algorithmic Audio Sync',
        recommendedAudio: 'Slowed + Reverb Phonk (115 BPM - Aesthetic Vibe)',
        audioId: 'slowed_reverb_phonk',
        tiktokAudioQuery: `Slowed Reverb Phonk ${cleanCap}`,
        hashtags: [`#${tag}`, '#tiktokalgorithm', '#viralsound', '#watchtime'],
        promptIdea: `Why pairing ${cleanCap} gameplay with 140 BPM phonk triggers the TikTok recommendation loop.`
      }
    ];
  }

  // 4. DEFAULT: VERIFIED WARZONE SEASON 6 METAS & FACELESS
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
