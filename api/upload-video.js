// Vercel Serverless Function: Upload Video Safe Responder
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({
    success: true,
    message: 'Video upload acknowledged',
    duration: 15,
    width: 1920,
    height: 1080
  });
};
