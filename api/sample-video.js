// Vercel Serverless Function: Sample Video Provider
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({
    success: true,
    filename: 'demo_clip.mp4',
    videoUrl: '/sample/demo_clip.mp4',
    videoPath: 'demo_clip.mp4',
    duration: 15,
    width: 1280,
    height: 720
  });
};
