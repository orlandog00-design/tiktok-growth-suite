// Vercel Serverless Function: Viral Script & Hook Generator Engine with Idea Co-Pilot
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const {
      topic = 'Warzone Season 6 meta',
      niche = 'general',
      tone = 'energetic',
      duration = '30',
      goal = 'comments',
      apiKey,
      model = 'gemini-1.5-flash',
      refinement = '',
      previousScript = null
    } = req.body || {};

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Please enter a topic or concept.' });
    }

    // Live Google Gemini API call if visitor provided their own key
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const cleanModel = model.replace(/^models\//, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;

        const systemPrompt = `You are an elite viral TikTok and YouTube Shorts retention strategist and script co-pilot.
Your goal is to turn ANY user idea, highlight, or communication into a high-retention 9:16 short-form video script that maximizes watch time, shares, and comments.

CRITICAL INSTRUCTIONS:
1. ADAPT TO THE USER'S ACTUAL CONCEPT:
   - If the user writes about a NUKE or high streak (e.g. "Got another nuke with the boys"): write an intense, high-stakes story about the countdown, defending against sweat squads, chaotic comms, and the final victory detonation. DO NOT force it into a gun class setup!
   - If the user writes about a 1v4 CLUTCH: write about isolating 1v1 gunfights, camera breaks, and 1 HP survival.
   - If the user writes about FUNNY / TOXIC COMMS: write about proximity chat reactions, screaming teammates, and lobby banter.
   - If the user specifically writes about a WEAPON LOADOUT or META: only then include attachments, recoil, and TTK stats (Warzone Season 6 guns: Voyak KT-3, VMP, MPC-25, Strider 300, DS20 Mirage).
   - If the user writes about ROBLOX, FORTNITE, MINECRAFT, or a REAL-LIFE STORY: tailor the hooks and narrative purely to that game/story.
2. IF A REFINEMENT OR FOLLOW-UP IS PROVIDED:
   - Carefully read the user's communication (e.g. "make it funnier", "focus on the final 10 seconds of the nuke", "add screaming proximity comms") and rewrite/evolve the script to match.

Output MUST strictly follow this JSON schema:
{
  "title": "High-CTR title for the video",
  "hooks": [
    {
      "type": "Hook archetype name (e.g. The 15-Second Siren, Chaos Comms, Disbeliever Challenge)",
      "visual": "[VISUAL: Description of fast-paced visual action or text hook on screen]",
      "spoken": "The exact spoken hook words (under 14 words, punchy)",
      "score": "99% Retention Score"
    }
  ],
  "segments": [
    {
      "time": "0:00 - 0:03",
      "section": "The Hook",
      "spoken": "Spoken sentence",
      "visual": "[VISUAL: Fast-paced visual cue]",
      "sfx": "[SFX: Sound effect cue]"
    }
  ],
  "recommendedAudio": {
    "title": "Song name or viral beat style (e.g. Brazilian Phonk Drift, Dark 808 Drill, Sigma Drop)",
    "audioId": "phonk_drift"
  },
  "endingCTA": "Punchy call to action to maximize comments or saves",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

        let userPrompt = `Create a viral ${duration}-second TikTok script on the user's idea: "${topic}".
Niche: ${niche}
Tone: ${tone}
Goal: ${goal}
Provide 4 distinct viral hook options to choose from, followed by 4-5 punchy video segments, a high-converting ending CTA, recommended viral audio style, and 5-8 trending hashtags.`;

        if (refinement && refinement.trim()) {
          userPrompt += `\n\nUSER FOLLOW-UP COMMUNICATION & REFINEMENT:\n"${refinement.trim()}"\nAdjust and improve the script according to what the user communicates above.`;
          if (previousScript) {
            userPrompt += `\n\nPREVIOUS SCRIPT CONTEXT:\n${typeof previousScript === 'string' ? previousScript : JSON.stringify(previousScript)}`;
          }
        }

        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}` }] }],
            generationConfig: {
              temperature: 0.8,
              responseMimeType: "application/json"
            }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const segments = parsed.segments || [];
            const fullText = segments.map(s => s.spoken).join(' ');
            const wordCount = fullText ? fullText.split(/\s+/).length : 60;
            const estimatedSeconds = Math.round(wordCount / 2.7);

            return res.json({
              source: 'gemini',
              model,
              title: parsed.title || topic,
              topic,
              niche,
              hooks: parsed.hooks || [],
              segments: segments,
              recommendedAudio: parsed.recommendedAudio || { title: 'Brazilian Phonk Drift (136 BPM)', audioId: 'phonk_drift' },
              endingCTA: parsed.endingCTA || 'Tag the boys in the comments and drop your highest streak!',
              hashtags: parsed.hashtags || ['#warzone', '#codclips', '#gaming', '#fyp'],
              fullText,
              wordCount,
              estimatedSeconds,
              seo: {
                caption: `${parsed.title || topic} 💀 Wait till the end...`,
                hashtags: parsed.hashtags || ['#warzone', '#codclips', '#gaming', '#fyp']
              }
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini script generation failed, falling back to neural template:', geminiErr.message);
      }
    }

    // Built-in intelligent idea engine if no API key is provided or on fallback
    const result = generateViralScript({ topic, niche, tone, duration, goal, refinement });
    return res.json({ source: 'builtin', ...result });
  } catch (err) {
    console.error('Error generating script:', err);
    return res.status(500).json({ error: 'Failed to generate script.' });
  }
};

function classifyIdea(text = '') {
  const kw = text.toLowerCase();
  if (kw.includes('nuke') || kw.includes('bomb') || kw.includes('champion') || kw.includes('quest') || kw.includes('streak') || kw.includes('30-bomb') || kw.includes('30 bomb') || kw.includes('detonate')) {
    return 'nuke';
  }
  if (kw.includes('clutch') || kw.includes('1v4') || kw.includes('1v3') || kw.includes('1v2') || kw.includes('1 hp') || kw.includes('last alive') || kw.includes('wipe') || kw.includes('squad wipe') || kw.includes('gas play')) {
    return 'clutch';
  }
  if (kw.includes('comm') || kw.includes('rage') || kw.includes('toxic') || kw.includes('screamed') || kw.includes('yell') || kw.includes('funny') || kw.includes('troll') || kw.includes('proximity') || kw.includes('prox')) {
    return 'comms';
  }
  if (kw.includes('roblox') || kw.includes('bloxfruits') || kw.includes('dress to impress') || kw.includes('dti') || kw.includes('doors')) {
    return 'roblox';
  }
  if (kw.includes('fortnite') || kw.includes('zero build') || kw.includes('unreal')) {
    return 'fortnite';
  }
  if (kw.includes('setting') || kw.includes('aimbot') || kw.includes('aim assist') || kw.includes('footstep') || kw.includes('audio') || kw.includes('movement') || kw.includes('slide cancel')) {
    return 'settings_movement';
  }
  if (kw.includes('loadout') || kw.includes('class') || kw.includes('meta') || kw.includes('ttk') || kw.includes('build') || kw.includes('attachments') || kw.includes('recoil') || kw.includes('gun') || kw.includes('smg') || kw.includes('ar') || kw.includes('sniper')) {
    return 'loadout_meta';
  }
  return 'general_idea';
}

function generateViralScript({ topic, niche, tone, duration, goal, refinement = '' }) {
  const combined = `${topic} ${refinement}`.trim();
  const archetype = classifyIdea(combined);
  const wantsFunny = combined.toLowerCase().includes('funny') || combined.toLowerCase().includes('comm') || combined.toLowerCase().includes('scream') || combined.toLowerCase().includes('laugh');
  const isShort = duration === '15' || combined.toLowerCase().includes('15s') || combined.toLowerCase().includes('short');

  let hookOptions = [];
  let segments = [];
  let endingCTA = '';
  let audioRecommendation = { title: 'Brazilian Phonk Drift (136 BPM)', audioId: 'phonk_drift' };
  let hashtags = ['#warzone', '#rebirthisland', '#codclips', '#gaming', '#fyp'];

  if (archetype === 'nuke') {
    audioRecommendation = { title: 'Brazilian Phonk Drift (136 BPM - Movement/Kills)', audioId: 'phonk_drift' };
    hashtags = ['#warzone', '#warzonenuke', '#rebirthisland', '#championsquest', '#nuke', '#codclips'];

    hookOptions = [
      {
        type: 'The 15-Second Countdown (Urgency)',
        visual: '[VISUAL: Champion\'s Quest tactical nuke site pulsing red with 15s timer ticking down, thermal smoke in air]',
        spoken: 'We had literally 15 seconds left before the entire lobby pushed our nuke site.',
        score: '99% Viral Retention'
      },
      {
        type: 'The Siren Warning (Adrenaline)',
        visual: '[VISUAL: Full map alert showing every red squad dot sprinting directly toward our building]',
        spoken: 'If you ever hear this siren in Rebirth Island Season 6, leave the game immediately.',
        score: '98% Viral Retention'
      },
      {
        type: 'The Disbelievers (Skeptic Challenge)',
        visual: '[VISUAL: Full squad in tactical skins holding rooftops with sniper and smoke grenades]',
        spoken: 'Everyone said dropping back-to-back nukes in Season 6 was impossible... until this happened.',
        score: '97% Viral Retention'
      },
      {
        type: 'The Chaos Comms (Relatable Banter)',
        visual: '[VISUAL: Heart rate monitor overlay pulsing at 175 BPM as killfeed lights up green and red]',
        spoken: 'Listen to our comms when all 4 squads pushed our nuke defuse at the exact same second.',
        score: '96% Viral Retention'
      }
    ];

    endingCTA = goal === 'saves' 
      ? 'Save this video right now before you attempt your next Champion\'s Quest contract with the boys!'
      : 'Have you and the boys ever dropped a nuke? Tag your squad in the comments and drop your highest streak!';

    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Nuke contract siren + Armor break crunch]'
      },
      {
        time: '0:03 - 0:10',
        section: 'The Elements Extraction',
        spoken: wantsFunny
          ? 'We just grabbed the radioactive elements, and my boy starts screaming on the mic: "THEY ARE PARACHUTING ON THE ROOF, SHOOT THEM!"'
          : 'We just secured the third radioactive element on Rebirth, but the whole lobby got marked and every single sweat team started flying in on us.',
        visual: '[VISUAL: Fast parachute drops landing on building roof, red tracers flying through windows]',
        sfx: '[SFX: Proximity chat screaming / Parachute pop]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The 1-HP Bomb Defense',
        spoken: 'My teammates got wiped in the gas. I had zero plates, 30 bullets in the mag, and had to 1v3 the defuse team with 5 seconds on the clock.',
        visual: '[VISUAL: High-octane spray transfer dropping two enemies defusing the bomb, sliding behind deployable cover]',
        sfx: '[SFX: Heartbeat monitor swell + Headshot dink]'
      },
      {
        time: '0:20 - 0:26',
        section: 'The Detonation',
        spoken: 'The countdown hit zero. The tactical siren went off, and the entire island got deleted in blinding white light.',
        visual: '[VISUAL: Screen flashes blinding white into massive cinematic mushroom cloud victory splash screen]',
        sfx: '[SFX: Heavy sub-bass nuke explosion + Brazilian Phonk beat drop]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Warzone Champion Victory banner with nuke rewards operator skin]',
        sfx: '[SFX: Victory theme]'
      }
    ];
  } else if (archetype === 'clutch') {
    audioRecommendation = { title: 'Dark 808 Drill (140 BPM - Heavy Sub-Bass & Wipes)', audioId: 'dark_808_drill' };
    hashtags = ['#warzoneclutch', '#1v4clutch', '#rebirthisland', '#warzonemeta', '#codclips'];

    hookOptions = [
      {
        type: 'The Hopeless Situation (Curiosity Gap)',
        visual: '[VISUAL: 1v4 clutch situation with 4 red enemy pings on mini-map, heart rate monitor graphic]',
        spoken: 'My entire squad was dead, buy station was in the gas, and 3 teams were watching my POV.',
        score: '99% Viral Retention'
      },
      {
        type: 'The 1-HP Survival (Adrenaline)',
        visual: '[VISUAL: Screen flashing intense red at 1 HP with gas mask breaking]',
        spoken: 'This is why you NEVER give up even when you are 1 HP in the final circle.',
        score: '98% Viral Retention'
      },
      {
        type: 'The Camera-Break Trick (Skill Flex)',
        visual: '[VISUAL: Insane slide-cancel break breaking enemy camera in super slow-mo]',
        spoken: 'Watch how I completely baited and wiped this entire sweaty team using this one angle.',
        score: '97% Viral Retention'
      },
      {
        type: 'The Underestimate Trap',
        visual: '[VISUAL: 3 enemies sprinting with knives out thinking it is an easy kill]',
        spoken: 'They thought I was out of ammo, so all four of them ego-pushed me at once.',
        score: '96% Viral Retention'
      }
    ];

    endingCTA = 'What would you have done in this 1v4? Drop your reaction in the comments!';
    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Gas mask crack + Heartbeat monitor]'
      },
      {
        time: '0:03 - 0:10',
        section: 'Isolating The Gunfight',
        spoken: 'Instead of panicking, I used the staircase door to break their line of sight and forced them into four separate 1v1 gunfights.',
        visual: '[VISUAL: Quick slide cancel through door, dropping first player before teammates can trade]',
        sfx: '[SFX: Gunfire + Armor crack]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The Double Down',
        spoken: 'The second guy tried to jump-shot me, but I camera-broke him with a drop-shot, grabbed his armor satchel, and re-plated at 1 HP.',
        visual: '[VISUAL: Drop-shot spray transfer deleting second enemy, rapid armor plate equip animation]',
        sfx: '[SFX: Double kill voiceover + Headshot chime]'
      },
      {
        time: '0:20 - 0:26',
        section: 'The Final Squad Wipe',
        spoken: 'Last two enemies pushed together with stuns. I pre-fired the doorway, cracked both of them, and secured the team wipe.',
        visual: '[VISUAL: Red squad wipe banner lights up screen, kill feed flashes 4 green notifications]',
        sfx: '[SFX: Squad wipe guitar riff / Phonk bass drop]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Warzone 1st Place Victory splash with animated follow button]',
        sfx: '[SFX: Victory chime]'
      }
    ];
  } else if (archetype === 'comms') {
    audioRecommendation = { title: 'Bouncy 808 Trap (132 BPM - Commentary)', audioId: 'bouncy_trap' };
    hashtags = ['#deathcomms', '#proximitychat', '#warzonefunny', '#codrage', '#gamingcomms'];

    hookOptions = [
      {
        type: 'The Death Comm Rage (High Emotion)',
        visual: '[VISUAL: In-game proximity chat microphone icon glowing aggressively red]',
        spoken: 'His reaction on death comms made my entire squad mute their headsets.',
        score: '99% Viral Retention'
      },
      {
        type: 'The Regret Warning (Banter)',
        visual: '[VISUAL: Teammate charging into a building with a riot shield and instantly getting blown up]',
        spoken: 'I told my teammate NOT to push this room, and this is what immediately happened.',
        score: '98% Viral Retention'
      },
      {
        type: 'The Unhinged Proximity Chat',
        visual: '[VISUAL: Enemy squad whispering creepy sounds through the floorboards of prison]',
        spoken: 'This is officially the most unhinged proximity chat lobby in Warzone history.',
        score: '97% Viral Retention'
      },
      {
        type: 'The Trash-Talk Karma',
        visual: '[VISUAL: Enemy player doing an emote in pre-lobby before getting sniped across the map]',
        spoken: 'He spent 10 minutes talking trash until he ran into my sniper rifle.',
        score: '96% Viral Retention'
      }
    ];

    endingCTA = 'What is the craziest death comm you have ever heard? Tell me in the comments!';
    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Mic static + Rage yell]'
      },
      {
        time: '0:03 - 0:10',
        section: 'The Standoff',
        spoken: 'We were holding water tower on Rebirth, and this team below us started threatening to push us with shotguns.',
        visual: '[VISUAL: Proximity chat audio visualizer showing player tag glowing]',
        sfx: '[SFX: Proximity chat chatter]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The Play',
        spoken: 'My teammate threw a decoy grenade to the left, I hit a clean throwing knife through the window, and listen to what he screams on the mic.',
        visual: '[VISUAL: Throwing knife bounces off doorframe and downs player in 0.2s]',
        sfx: '[SFX: Knife hit sound + Mic explosion]'
      },
      {
        time: '0:20 - 0:26',
        section: 'The Unfiltered Reaction',
        spoken: 'He completely lost his mind, smashed his controller, and left the lobby before his squad could even buy him back.',
        visual: '[VISUAL: Enemy player disconnects from match, teammate laughing uncontrollably in comms]',
        sfx: '[SFX: Controller slam / Wheezing laugh]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Animated comment prompt with microphone emoji]',
        sfx: '[SFX: Ding]'
      }
    ];
  } else if (archetype === 'roblox') {
    audioRecommendation = { title: 'Hyper-Drive Hardstyle (150 BPM - Camera Breaker)', audioId: 'hyper_hardstyle' };
    hashtags = ['#roblox', '#robloxtips', '#robloxedit', '#dresstoimpress', '#bloxfruits'];

    hookOptions = [
      {
        type: 'The Banned Glitch (Curiosity)',
        visual: '[VISUAL: Character moving at 400% speed across Roblox map with particle effects]',
        spoken: `The secret ${topic} glitch winning every single server before developers patch it.`,
        score: '99% Viral Retention'
      },
      {
        type: 'The Unsolved Mystery (Suspense)',
        visual: '[VISUAL: Secret hidden door behind room 150 pulsing with purple aura]',
        spoken: `Nobody noticed this hidden room in ${topic}... until we walked inside.`,
        score: '98% Viral Retention'
      },
      {
        type: 'The 1-Shot PvP Combo (Meta)',
        visual: '[VISUAL: 3-hit combo deleting max level player in 0.5 seconds]',
        spoken: `Stop losing your bounty fights—here is the uncounterable ${topic} combo.`,
        score: '97% Viral Retention'
      },
      {
        type: 'The Free Robux Method',
        visual: '[VISUAL: Robux balance ticking up legitimately in creator studio]',
        spoken: `Stop falling for scams—here is the exact method creators use for free Robux.`,
        score: '96% Viral Retention'
      }
    ];

    endingCTA = 'Does this still work on your server? Try it right now and tell me in the comments!';
    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Glitch whoosh / Pop]'
      },
      {
        time: '0:03 - 0:10',
        section: 'The Secret Step',
        spoken: `First, equip your item and trigger the animation at the exact second you enter the server.`,
        visual: '[VISUAL: Slow-motion cursor click highlighting the exact timing frame]',
        sfx: '[SFX: Chime]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The Execution',
        spoken: `Now jump into the corner—notice how the physics engine completely glitches out and gives you unlimited speed boost.`,
        visual: '[VISUAL: Speedometer climbing from 16 to 120 speed instantly]',
        sfx: '[SFX: Hardstyle drop / Speed sound]'
      },
      {
        time: '0:20 - 0:26',
        section: 'The Proof',
        spoken: `You will win 100% of your rounds and rank up in minutes before anyone figures it out.`,
        visual: '[VISUAL: 1st place victory trophy animation on screen]',
        sfx: '[SFX: Victory trumpets]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Comment animation with follow button]',
        sfx: '[SFX: Ding]'
      }
    ];
  } else if (archetype === 'loadout_meta') {
    audioRecommendation = { title: 'Brazilian Phonk Drift (136 BPM - Movement/Kills)', audioId: 'phonk_drift' };
    hashtags = ['#warzonemeta', '#warzoneloadout', '#season6meta', '#warzonetips', '#rebirthisland'];

    hookOptions = [
      {
        type: 'The Broken TTK Alert',
        visual: '[VISUAL: High-octane squad wipe with Voyak KT-3 deleting armor in 400ms]',
        spoken: `Stop using your old class—this ${topic} build secretly has zero recoil and 400ms TTK.`,
        score: '99% Viral Retention'
      },
      {
        type: 'The Secret Attachment Buff',
        visual: '[VISUAL: Gunsmith screen showing hidden damage range bar increasing by 40%]',
        spoken: `The developers secretly buffed this setup in Season 6 and nobody noticed yet.`,
        score: '98% Viral Retention'
      },
      {
        type: 'The No-Recoil Laser',
        visual: '[VISUAL: Firing at a wall 50 meters away, all bullets hit the exact same bullet hole]',
        spoken: `If you struggle with recoil on controller, put these exact attachments on right now.`,
        score: '97% Viral Retention'
      },
      {
        type: 'The Rebirth Demon Setup',
        visual: '[VISUAL: Fast slide-canceling through chemical engineering wiping 3 players]',
        spoken: `This is the exact loadout pro players are running in $100K Warzone tournaments.`,
        score: '96% Viral Retention'
      }
    ];

    endingCTA = 'Drop your current loadout in the comments and I will tell you if it beats this!';
    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Armor crack crunch]'
      },
      {
        time: '0:03 - 0:10',
        section: 'The Secret Stats',
        spoken: 'While everyone is still running old nerfs, this setup has a 390 millisecond time-to-kill and max strafe speed.',
        visual: '[VISUAL: Side-by-side TTK chart showing 390ms vs 620ms with green checkmark]',
        sfx: '[SFX: Whoosh]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The 5 Attachments',
        spoken: 'Screenshot this class right now: run the compensated muzzle, heavy barrel for bullet velocity, ergonomic grip, and 45-round mag.',
        visual: '[VISUAL: Gunsmith screen showing all 5 attachment slots clearly highlighted]',
        sfx: '[SFX: Camera shutter / Ding]'
      },
      {
        time: '0:20 - 0:26',
        section: 'Gameplay Proof',
        spoken: 'Look at how fast it deletes squads at medium range—you do not even have to pull down on the right thumbstick.',
        visual: '[VISUAL: Beaming two players off the lighthouse on Rebirth Island with zero recoil]',
        sfx: '[SFX: Headshot chime + Phonk drop]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Animated save button and comment prompt]',
        sfx: '[SFX: Ding]'
      }
    ];
  } else {
    // General user idea / Story / Life / Tech / Custom Concept
    audioRecommendation = { title: 'Bouncy 808 Trap (132 BPM)', audioId: 'bouncy_trap' };
    hashtags = ['#viral', '#fyp', '#storytime', '#trending', '#learnontiktok'];

    hookOptions = [
      {
        type: 'The Pattern Interrupt (Curiosity)',
        visual: '[VISUAL: Rapid zoom-in with on-screen bold text pop-up]',
        spoken: `Nobody is talking about ${topic}, but this completely changed everything.`,
        score: '99% Viral Retention'
      },
      {
        type: 'The Stop Doing This (Urgent Contrarian)',
        visual: '[VISUAL: Hand held up to lens shaking head with warning graphic]',
        spoken: `Stop making this massive mistake with ${topic} before it is too late.`,
        score: '98% Viral Retention'
      },
      {
        type: 'The Feels Illegal Revelation',
        visual: '[VISUAL: Screen recording showing step-by-step insight with glowing circle]',
        spoken: `This one secret about ${topic} feels completely illegal to know.`,
        score: '97% Viral Retention'
      },
      {
        type: 'The Brutal Truth',
        visual: '[VISUAL: Lean in close to camera with serious expression]',
        spoken: `I am going to be brutally honest about ${topic}, even if people hate it.`,
        score: '96% Viral Retention'
      }
    ];

    endingCTA = 'Do you agree or disagree? Drop your honest thoughts in the comments!';
    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Whoosh / Sub-bass hit]'
      },
      {
        time: '0:03 - 0:10',
        section: 'The Problem / Agitation',
        spoken: `Most people think ${topic} is complicated, but 99% of people are approaching it completely backwards.`,
        visual: '[VISUAL: Fast b-roll cuts with animated red X mark on screen]',
        sfx: '[SFX: Record scratch]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The Core Insight',
        spoken: `Here is what actually happens: When you focus on this single high-leverage move, your results multiply immediately.`,
        visual: '[VISUAL: Text pop-up on screen: "THE #1 VIRAL LEVER" with highlighted green arrow]',
        sfx: '[SFX: Camera shutter / Pop]'
      },
      {
        time: '0:20 - 0:26',
        section: 'The Real-World Proof',
        spoken: `The moment you apply this, everything clicks into place because you are finally working with how people actually think.`,
        visual: '[VISUAL: Fast-paced proof graphic or cinematic zoom-in]',
        sfx: '[SFX: Chime / Ding]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Animated finger pointing toward comment button]',
        sfx: '[SFX: Bell sound]'
      }
    ];
  }

  const fullText = segments.map(s => s.spoken).join(' ');
  const wordCount = fullText.split(/\s+/).length;
  const estimatedSeconds = Math.round(wordCount / 2.7);

  return {
    title: topic,
    topic,
    niche,
    hooks: hookOptions,
    segments,
    recommendedAudio: audioRecommendation,
    endingCTA,
    hashtags,
    fullText,
    wordCount,
    estimatedSeconds,
    seo: {
      caption: `${topic} 💀 Wait till the end...`,
      hashtags: hashtags
    }
  };
}
