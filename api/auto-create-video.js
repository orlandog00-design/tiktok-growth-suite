// Vercel Serverless Function: Auto Create Video Proxy & Responder
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

      const backendRes = await fetch(`${TUNNEL_URL}/api/auto-create-video`, {
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
      console.warn('Auto create tunnel forward failed:', err.message);
    }
  }

  return res.json({
    success: true,
    clientRender: true,
    message: 'Rendering via client-side video compositor.'
  });
};
