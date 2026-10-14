module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { apiKey } = req.body || {};
    if (!apiKey || apiKey.trim().length < 10) {
      return res.status(400).json({ valid: false, error: 'Please enter a valid Gemini API key.' });
    }

    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;
    const testRes = await fetch(testUrl);
    if (testRes.ok) {
      const data = await testRes.json();
      const modelNames = (data.models || []).map(m => m.name.replace('models/', ''));
      return res.json({ valid: true, models: modelNames });
    } else {
      const errData = await testRes.json().catch(() => ({}));
      return res.status(401).json({ valid: false, error: errData.error?.message || 'Invalid Gemini API key.' });
    }
  } catch (e) {
    return res.status(500).json({ valid: false, error: e.message });
  }
};
