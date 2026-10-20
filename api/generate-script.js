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
1. STRICT ADHERENCE TO THE USER'S ACTUAL CONCEPT:
   - If the user asks for CONTROLLER SETTINGS, SENSITIVITY, or DEADZONES (e.g. "best controller settings for warzone TRY NOW!"): The script MUST be 100% about controller sensitivity, stick deadzones, aim response curve (Dynamic), and rotational aim assist. NEVER output a weapon build, proximity chat, or rage script when the user asks for settings!
   - If the user asks for AUDIO / FOOTSTEP SETTINGS: The script MUST be about audio mix presets, Loudness Equalization, Master volume, and hearing footsteps clearly.
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
      "type": "Hook archetype name",
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
    "title": "Song name or viral beat style",
    "audioId": "phonk_drift"
  },
  "endingCTA": "Punchy call to action to maximize comments or saves",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

        let userPrompt = `Create a viral ${duration}-second TikTok script on the user's exact idea: "${topic}".
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

  // Controller Settings & Sensitivity (Strict check before comms/troll!)
  if (/\b(controller|sens|sensitivity|deadzone|deadzones|aim\s*assist|response\s*curve|stick\s*drift|centering|linear|dynamic)\b/i.test(kw)) {
    return 'settings_controller';
  }

  // Audio / Sound / Footstep Settings
  if (/\b(audio|sound|footstep|footsteps|loudness\s*eq|equalizer|hearing|surround|mix\s*preset)\b/i.test(kw)) {
    return 'settings_audio';
  }

  // Movement & Mechanics
  if (/\b(omnimovement|movement|slide\s*cancel|sliding|camera\s*break|bhop|bunny\s*hop|mantle|strafe)\b/i.test(kw)) {
    return 'movement';
  }

  // Fortnite
  if (/\b(fortnite|zero\s*build|v-bucks|vbucks|unreal|ranked\s*fortnite|victory\s*royale|chug\s*jug|battle\s*bus)\b/i.test(kw)) {
    return 'fortnite';
  }

  // Roblox
  if (/\b(roblox|bloxfruits|blox\s*fruits|dress\s*to\s*impress|dti|doors|robux|brookhaven)\b/i.test(kw)) {
    return 'roblox';
  }

  // Nuke & Champion's Quest
  if (/\b(nuke|champion'?s?\s*quest|30\s*bomb|30-bomb|tactical\s*nuke|detonate|detonation)\b/i.test(kw)) {
    return 'nuke';
  }

  // 1v4 Clutch & Wipes
  if (/\b(clutch|1v4|1v3|1v2|1\s*hp|last\s*alive|squad\s*wipe|gas\s*play)\b/i.test(kw)) {
    return 'clutch';
  }

  // Toxic / Funny Comms & Proximity Chat (Word boundary matches, NEVER inside 'controller'!)
  if (/\b(comm|comms|death\s*comm|death\s*comms|proximity|prox\s*chat|rage|screamed|screaming|toxic|trash\s*talk|troll|trolling|yell|yelling)\b/i.test(kw)) {
    return 'comms';
  }

  // General Settings
  if (/\b(setting|settings|graphics|fps|fov|optimization)\b/i.test(kw)) {
    return 'settings_controller';
  }

  // Weapon Loadout & Meta (requires weapon/gaming context so general "build an app" doesn't trigger)
  if (/\b(loadout|loadouts|weapon\s*build|gun\s*build|best\s*build|meta\s*build|class\s*setup|best\s*class|meta\s*class|custom\s*class|ttk|attachments?|no\s*recoil|zero\s*recoil|voyak|vmp|mpc|striker|superi|fjx|kar98k?)\b/i.test(kw)) {
    return 'loadout_meta';
  }
  if (/\b(smg|ar|assault\s*rifle|sniper|shotgun)\b/i.test(kw) && /\b(build|meta|gun|class|tier|setup)\b/i.test(kw)) {
    return 'loadout_meta';
  }

  return 'custom_concept';
}

function generateViralScript({ topic, niche, tone, duration, goal, refinement = '' }) {
  const combined = `${topic} ${refinement}`.trim();
  const archetype = classifyIdea(combined);
  const wantsFunny = combined.toLowerCase().includes('funny') || combined.toLowerCase().includes('comm') || combined.toLowerCase().includes('scream') || combined.toLowerCase().includes('laugh');

  let hookOptions = [];
  let segments = [];
  let endingCTA = '';
  let audioRecommendation = { title: 'Brazilian Phonk Drift (136 BPM)', audioId: 'phonk_drift' };
  let hashtags = ['#warzone', '#rebirthisland', '#codclips', '#gaming', '#fyp'];

  if (archetype === 'settings_controller') {
    audioRecommendation = { title: 'Suspense Countdown & Drop (130 BPM - Secret Class Reveal)', audioId: 'suspense_drop' };
    hashtags = ['#controllersettings', '#warzoneaim', '#aimassist', '#warzonetips', '#codsettings', '#gaming'];

    hookOptions = [
      {
        type: 'The Hidden Aim Assist Exploit (Curiosity)',
        visual: '[VISUAL: Thumbsticks micro-adjusting on controller with crosshairs snapping instantly onto target chest]',
        spoken: 'If your aim feels floaty on controller, change these two hidden settings right now.',
        score: '99% Viral Retention'
      },
      {
        type: 'The Banned Pro Response Curve (Secret)',
        visual: '[VISUAL: Controller settings menu showing Dynamic Response Curve and 0.85 ADS multiplier]',
        spoken: 'Every Warzone pro is secretly running this controller curve to break rotational aim assist.',
        score: '98% Viral Retention'
      },
      {
        type: 'Stop Playing On Default (Urgent Warning)',
        visual: '[VISUAL: Firing 40 rounds into a dummy without moving thumbstick - 100% headshot accuracy]',
        spoken: 'Stop playing on default sensitivity—these 3 numbers eliminate recoil completely.',
        score: '97% Viral Retention'
      },
      {
        type: 'The Instant Aim Snapping Trick',
        visual: '[VISUAL: Centering dot locked onto enemy chest before even ADS-ing through doorframe]',
        spoken: 'Here is why your controller aim assist is not locking on like the streamers.',
        score: '96% Viral Retention'
      }
    ];

    endingCTA = goal === 'saves'
      ? 'Bookmark and save this video right now before you hop into your next match!'
      : 'What sensitivity do you currently play on? Drop your numbers in the comments!';

    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Headshot ping / Controller click]'
      },
      {
        time: '0:03 - 0:10',
        section: 'Deadzones Calibration',
        spoken: 'First, go to deadzones. Set your Left Stick Min to 2, Right Stick Min to 3, and drop your Max deadzone to 85 for instantaneous stick response.',
        visual: '[VISUAL: Controller menu with yellow highlight around stick deadzone sliders]',
        sfx: '[SFX: Menu click chime]'
      },
      {
        time: '0:10 - 0:20',
        section: 'Sensitivity & Response Curve',
        spoken: 'Next, switch your Aim Response Curve Type from Standard to Dynamic, set your sensitivity to 6-6, and drop your ADS Sensitivity Multiplier to 0.85.',
        visual: '[VISUAL: Dynamic response curve graph animation showing instant rotational acceleration]',
        sfx: '[SFX: Whoosh / Snap]'
      },
      {
        time: '0:20 - 0:26',
        section: 'Rotational Aim Assist Lock',
        spoken: 'Finally, make sure Aim Assist Type is set to Default or Black Ops, and keep your left stick slightly engaged while firing to trigger 100% rotational tracking.',
        visual: '[VISUAL: Side-by-side gameplay showing crosshair tracking an enemy sprinting through smoke with zero human effort]',
        sfx: '[SFX: Armor crack / Double kill]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Full summary cheat sheet screen with all controller values on display]',
        sfx: '[SFX: Camera shutter]'
      }
    ];
  } else if (archetype === 'settings_audio') {
    audioRecommendation = { title: 'Suspense Countdown & Drop (130 BPM)', audioId: 'suspense_drop' };
    hashtags = ['#audiosettings', '#warzoneaudio', '#footsteps', '#gamingtips', '#warzone'];

    hookOptions = [
      {
        type: 'The Footstep Wallhack (Audio Exploit)',
        visual: '[VISUAL: Audio visualizer spiking red as enemy footsteps approach through concrete floor]',
        spoken: 'Turn this hidden audio setting on right now if you cannot hear footsteps.',
        score: '99% Viral Retention'
      },
      {
        type: 'The Sound EQ Trick',
        visual: '[VISUAL: Sound settings menu highlighting PC Loudness Equalization / Headphone Bass Boost]',
        spoken: 'Streamers are not hacking—they just turned on this one sound equalizer setting.',
        score: '98% Viral Retention'
      },
      {
        type: 'Stop Getting Snuck Up On',
        visual: '[VISUAL: Turning 180 degrees instantly and pre-firing an enemy sprinting up metal stairs]',
        spoken: 'Here is the exact audio mix to hear enemies parachuting 100 meters away.',
        score: '97% Viral Retention'
      },
      {
        type: 'Eliminate Bass Drone',
        visual: '[VISUAL: Disabling air strike rumble while footstep frequencies boost to 200%]',
        spoken: 'If precision airstrikes keep deafening your headset, change this immediately.',
        score: '96% Viral Retention'
      }
    ];

    endingCTA = 'Can you hear footsteps properly in Warzone? Tell me what headset you use below!';

    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Footstep crunch + Ear ping]'
      },
      {
        time: '0:03 - 0:10',
        section: 'Audio Mix Preset',
        spoken: 'Go into your audio menu and change Audio Mix from Cinema to Headphone Bass Boost. This cuts muddy high frequencies and isolates enemy footsteps.',
        visual: '[VISUAL: In-game audio settings menu cycling to Headphone Bass Boost]',
        sfx: '[SFX: Menu select]'
      },
      {
        time: '0:10 - 0:20',
        section: 'Volume Balance',
        spoken: 'Drop Master Volume to 80, turn Dialogue down to 30 so announcers do not scream over your fights, and turn Gameplay Music completely to ZERO.',
        visual: '[VISUAL: Sliders moving to recommended balance with green checkmarks]',
        sfx: '[SFX: Audio slider whoosh]'
      },
      {
        time: '0:20 - 0:26',
        section: 'Loudness Equalization',
        spoken: 'If you are on PC, enable Loudness Equalization in Windows Sound properties—it compresses loud gunshots and makes distant footsteps 3 times louder.',
        visual: '[VISUAL: Windows sound enhancement panel checking Loudness Equalization box]',
        sfx: '[SFX: Crisp footstep sound]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Headset graphic with animated soundwaves and comment prompt]',
        sfx: '[SFX: Ding]'
      }
    ];
  } else if (archetype === 'movement') {
    audioRecommendation = { title: 'Brazilian Phonk Drift (136 BPM - Movement/Kills)', audioId: 'phonk_drift' };
    hashtags = ['#warzonemovement', '#omnimovement', '#rebirthisland', '#camerabreak', '#codtips'];

    hookOptions = [
      {
        type: 'The Unhittable Movement Routine',
        visual: '[VISUAL: Omnimovement sprint sliding sideways through a doorway breaking enemy camera]',
        spoken: 'This new movement technique makes you literally impossible to hit.',
        score: '99% Viral Retention'
      },
      {
        type: 'The Camera-Break Secret',
        visual: '[VISUAL: Enemy POV showing our operator disappearing completely off their screen]',
        spoken: 'Here is how to break anyone\'s camera using this one omnimovement cancel.',
        score: '98% Viral Retention'
      },
      {
        type: 'The Infinite Slide Cancel',
        visual: '[VISUAL: Chaining 4 consecutive tactical sprint slides across open courtyard with zero delay]',
        spoken: 'Stop regular sprinting—this movement chain gives you permanent tactical sprint.',
        score: '97% Viral Retention'
      },
      {
        type: 'The Corner Peek Jump Shot',
        visual: '[VISUAL: Super bunny hop around corner pre-aiming headshot angle]',
        spoken: 'If you peek corners like this, you will win 9 out of 10 gunfights.',
        score: '96% Viral Retention'
      }
    ];

    endingCTA = 'Can you slide cancel consistently? Rate your movement from 1 to 10 in the comments!';

    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Slide sound + Camera whoosh]'
      },
      {
        time: '0:03 - 0:10',
        section: 'Sprint Behavior Settings',
        spoken: 'First, set your Automatic Sprint to Automatic Tactical Sprint, and change Slide/Dive Behavior to Tap to Slide so your inputs register instantly.',
        visual: '[VISUAL: Controller menu setting Automatic Tactical Sprint to ON]',
        sfx: '[SFX: Click]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The Omnimovement Angle',
        spoken: 'Instead of sliding straight forward, sprint diagonally, hit slide, and immediately flick your left stick backwards to break their aim assist tracking.',
        visual: '[VISUAL: Controller hand cam showing diagonal thumbstick flick with slow-mo gameplay]',
        sfx: '[SFX: Phonk beat drop]'
      },
      {
        time: '0:20 - 0:26',
        section: 'The Execution & Wipe',
        spoken: 'They shoot at empty air while you pop up on their shoulder and delete them before they can even turn around.',
        visual: '[VISUAL: Fast double kill spray transfer on two confused enemies]',
        sfx: '[SFX: Headshot dink + Armor crack]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Animated follow button with demon movement clip in background]',
        sfx: '[SFX: Victory chime]'
      }
    ];
  } else if (archetype === 'fortnite') {
    audioRecommendation = { title: 'Brazilian Phonk Drift (136 BPM)', audioId: 'phonk_drift' };
    hashtags = ['#fortnite', '#fortnitemeta', '#zerobuild', '#fortniteclips', '#rankedfortnite'];

    hookOptions = [
      {
        type: 'The Broken Zero Build Meta',
        visual: '[VISUAL: Striker AR deleting 250 shield in 0.4 seconds across open field]',
        spoken: `Stop using regular weapons—this ${topic} setup is completely breaking Fortnite.`,
        score: '99% Viral Retention'
      },
      {
        type: 'The Hidden Audio Advantage',
        visual: '[VISUAL: Visualize sound effects HUD showing footstep rings 50 meters away]',
        spoken: 'This one setting in Fortnite gives you legal wallhacks on every server.',
        score: '98% Viral Retention'
      },
      {
        type: 'The Uncontested Mythic Vault',
        visual: '[VISUAL: Dropping directly into secret underground vault grabbing gold loot in 30s]',
        spoken: 'Nobody is dropping at this secret location, and you get guaranteed gold weapons.',
        score: '97% Viral Retention'
      },
      {
        type: 'The Unreal Rank Strategy',
        visual: '[VISUAL: Victory Royale banner splashing with +12% Unreal rank progression]',
        spoken: 'Here is the exact strategy I used to hit Unreal in Solo Zero Build in 3 days.',
        score: '96% Viral Retention'
      }
    ];

    endingCTA = 'What rank are you in Fortnite right now? Drop your rank in the comments!';

    segments = [
      {
        time: '0:00 - 0:03',
        section: 'The Hook',
        spoken: hookOptions[0].spoken,
        visual: hookOptions[0].visual,
        sfx: '[SFX: Shield break crack + Chime]'
      },
      {
        time: '0:03 - 0:10',
        section: 'The Core Advantage',
        spoken: 'While everyone is carrying snipers, this weapon setup has maximum fire rate, zero bullet bloom, and shreds overshields before enemies can react.',
        visual: '[VISUAL: Side-by-side DPS comparison wiping full shield player instantly]',
        sfx: '[SFX: Gunfire whoosh]'
      },
      {
        time: '0:10 - 0:20',
        section: 'The Exact Mod Bench Setup',
        spoken: 'At the weapon bunker, attach the Red Dot optic, Muzzle Brake for recoil control, Speed Mag, and Laser for 100% hipfire accuracy.',
        visual: '[VISUAL: Mod bench interface snapping 4 gold attachments onto weapon]',
        sfx: '[SFX: Tool clink / Ding]'
      },
      {
        time: '0:20 - 0:26',
        section: 'Gameplay Victory',
        spoken: 'Look at how easily this lasers enemies flying in the air—you literally cannot miss a shot.',
        visual: '[VISUAL: Beaming a glider player out of the sky into 1st place Victory Royale]',
        sfx: '[SFX: Victory Royale fanfare + Phonk drop]'
      },
      {
        time: '0:26 - 0:30',
        section: 'Call To Action',
        spoken: endingCTA,
        visual: '[VISUAL: Victory Royale screen with animated comment prompt]',
        sfx: '[SFX: Chime]'
      }
    ];
  } else if (archetype === 'nuke') {
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
    // General user idea / Story / Life / Tech / Custom Concept (Dynamic keyword preservation)
    const cleanTopic = topic.replace(/[^\w\s]/gi, '').trim();
    audioRecommendation = { title: 'Bouncy 808 Trap (132 BPM)', audioId: 'bouncy_trap' };
    hashtags = ['#viral', '#fyp', '#storytime', '#trending', '#learnontiktok'];

    hookOptions = [
      {
        type: 'The Pattern Interrupt (Curiosity)',
        visual: `[VISUAL: Rapid zoom-in with on-screen bold text pop-up highlighting ${cleanTopic}]`,
        spoken: `Nobody is talking about ${topic}, but this completely changed everything.`,
        score: '99% Viral Retention'
      },
      {
        type: 'The Stop Doing This (Urgent Contrarian)',
        visual: `[VISUAL: Hand held up to lens shaking head with warning graphic on ${cleanTopic}]`,
        spoken: `Stop making this massive mistake with ${topic} before it is too late.`,
        score: '98% Viral Retention'
      },
      {
        type: 'The Feels Illegal Revelation',
        visual: `[VISUAL: Screen recording showing step-by-step insight with glowing circle around key detail]`,
        spoken: `This one secret about ${topic} feels completely illegal to know.`,
        score: '97% Viral Retention'
      },
      {
        type: 'The Brutal Truth',
        visual: `[VISUAL: Lean in close to camera with serious expression about ${cleanTopic}]`,
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
