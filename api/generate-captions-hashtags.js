module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { keyword = 'warzone clips', vibe = 'meta' } = req.body || {};
  const kw = (keyword || 'warzone clips').trim().toLowerCase();

  const isLoadout = /loadout|class|build|attachment|setup|gun|smg|ar|recoil|dmg|damage|melt|meta|voyak|vmp|mpc|strider|mirage/.test(kw);
  const isSniper = /sniper|strider|snipe|quickscope|headshot|range|bullet/.test(kw);
  const isMovement = /movement|slide|camera|demon|speed|fov|bhop|break|omnimovement/.test(kw);
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
        text: `The devs are 100% nerfing this Season 6 ${cleanKw} tomorrow... Save this before it's gone 💀🔥 Full tuning at the end 👇`,
        hookScore: '98% (Max Saves)'
      },
      {
        id: 'cap_2',
        title: '💬 The "Is This Broken?" Debate Starter',
        text: `Is this the FASTEST TTK in Warzone Season 6 or am I tripping? 🤔 Tag a teammate who needs to switch off their old class.`,
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
    nicheTags = ['#warzoneloadout', '#warzonemeta', '#season6meta', '#codloadout', '#warzonebuilds', '#rebirthmeta'];
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
        text: `No bullet drop? This ${cleanKw} setup is hitting 400m one-shots with zero lead in Season 6! 💀`,
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
    nicheTags = ['#warzonesniper', '#codsniper', '#strider300', '#snipersoftiktok', '#season6sniper', '#sniperclips'];
  } else if (isMovement) {
    captions = [
      {
        id: 'cap_1',
        title: '⚡ The "Camera Breaker" Hook',
        text: `How to break cameras like a $100K tournament pro in Warzone Season 6 🔥 Follow this exact controller setting for broken movement!`,
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
  } else {
    captions = [
      {
        id: 'cap_1',
        title: '🔥 The 1v4 Squad Wipe Clutch',
        text: `My squad died so I had to 1v4 for the win in Season 6... Heart was beating 180 BPM 💀 Rate this clutch 1-10 👇`,
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
        text: `The cleanest ${cleanKw} you'll see all day. Drop a follow for daily Season 6 meta clips and loadout tuning! 🔥`,
        hookScore: '93% (Follows Booster)'
      }
    ];
    nicheTags = ['#warzoneclips', '#rebirthisland', '#warzoneplays', '#warzoneclutch', '#codwarzone', '#season6'];
  }

  const recommendedStack = `${nicheTags.slice(0, 3).join(' ')} ${megaTags.slice(0, 2).join(' ')} #fyp #gametok`;

  return res.json({
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
};
