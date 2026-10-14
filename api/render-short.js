// Vercel Serverless Function: Render Short Proxy & Responder
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const TUNNEL_URL = 'https://entirely-merry-championship-permalink.trycloudflare.com';

  try {
    // Attempt forward to live local/cloud FFmpeg server via tunnel
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const backendRes = await fetch(`${TUNNEL_URL}/api/render-short`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.outputUrl && data.outputUrl.startsWith('/')) {
        data.outputUrl = `${TUNNEL_URL}${data.outputUrl}`;
      }
      return res.json(data);
    } else {
      const errData = await backendRes.json().catch(() => ({}));
      console.warn('Backend FFmpeg returned non-200:', errData);
    }
  } catch (err) {
    console.warn('FFmpeg tunnel unreachable from Lambda, delegating to client-side 9:16 engine:', err.message);
  }

  // Graceful fallback response instructing client-side canvas renderer
  return res.json({
    success: true,
    clientRender: true,
    message: 'Rendering 9:16 short directly in browser via client-side engine.'
  });
};
