// Vercel Serverless Function: Render Short Proxy & Responder
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const TUNNEL_URL = process.env.TUNNEL_URL;

  if (TUNNEL_URL && !TUNNEL_URL.includes('entirely-merry')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

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
      }
    } catch (err) {
      console.warn('FFmpeg tunnel unreachable, delegating to client-side 9:16 engine:', err.message);
    }
  }

  // Instant response instructing client-side canvas renderer with zero network delay
  return res.json({
    success: true,
    clientRender: true,
    message: 'Rendering 9:16 short directly in browser via client-side engine.'
  });
};
