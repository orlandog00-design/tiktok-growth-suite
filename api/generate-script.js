// Vercel Serverless Function: Viral Script & Hook Generator Engine
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { topic = 'Warzone Season 6 meta', niche = 'general', tone = 'energetic', duration = '30', goal = 'comments', apiKey, model = 'gemini-1.5-flash' } = req.body || {};

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Please enter a topic or concept.' });
    }

    // Live Google Gemini API call if visitor provided their own key
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const cleanModel = model.replace(/^models\//, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;

        const systemPrompt = `You are an elite viral TikTok and YouTube Shorts retention strategist. 
Your goal is to generate a high-performing 9:16 short-form video script that maximizes watch time, shares, and comments.
If the topic is gaming or Call of Duty, strictly align with Warzone SEASON 6 (S-Tier guns: Voyak KT-3, VMP, MPC-25, Strider 300, DS20 Mirage).
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
      "time": "0:00 - 0:03",
      "section": "The Hook",
      "spoken": "Spoken sentence",
      "visual": "[VISUAL: Fast-paced visual cue]",
      "sfx": "[SFX: Sound effect cue]"
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
            return res.json({
              source: 'gemini',
              model,
              hooks: parsed.hooks || [],
              segments: parsed.segments || [],
              endingCTA: parsed.endingCTA || 'Save this video before your next match!',
              hashtags: parsed.hashtags || ['#viral', '#trending', '#fyp']
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini script generation failed, falling back to neural template:', geminiErr.message);
      }
    }

    // Built-in neural generator if no API key is provided or on fallback
    const result = generateViralScript({ topic, niche, tone, duration, goal });
    return res.json({ source: 'builtin', ...result });
  } catch (err) {
    console.error('Error generating script:', err);
    return res.status(500).json({ error: 'Failed to generate script.' });
  }
};

function generateViralScript({ topic, niche, tone, duration, goal }) {
  const isGaming = niche.toLowerCase().includes('warzone') || 
                   niche.toLowerCase().includes('gaming') || 
                   topic.toLowerCase().includes('warzone') || 
                   topic.toLowerCase().includes('cod') ||
                   topic.toLowerCase().includes('loadout') ||
                   topic.toLowerCase().includes('rebirth');

  let hookOptions = [];

  if (isGaming) {
    hookOptions = [
      {
        type: 'The Broken Meta / Class Alert',
        visual: '[VISUAL: High-octane sniper flick or SMG squad wipe gameplay clip with glowing kill feed]',
        spoken: `Stop using your current class in Warzone right now—this ${topic} setup secretly has a 400ms TTK and zero recoil.`,
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
        spoken: `The developers secretly buffed this in Season 6, and while everyone is using the old meta, this setup deletes armor before they can even react.`,
        visual: '[VISUAL: Side-by-side TTK chart showing 400ms vs 650ms with animated green checkmark]',
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

  const fullText = segments.map(s => s.spoken).join(' ');
  const wordCount = fullText.split(/\s+/).length;
  const estimatedSeconds = Math.round(wordCount / 2.6);

  const hashtags = [
    `#${niche.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'warzone'}`,
    `#${topic.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'cod'}`,
    '#tiktokgrowth',
    '#foryoupage',
    '#viralhacks'
  ];

  return {
    hooks: hookOptions,
    segments,
    endingCTA,
    hashtags,
    fullText,
    estimatedSeconds
  };
}
