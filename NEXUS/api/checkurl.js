// Vercel serverless function — /api/checkurl?url=...
// Holds the Google Safe Browsing API key server-side (never exposed to the browser).
// Set GOOGLE_SAFE_BROWSING_KEY in your Vercel project's Environment Variables.

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!apiKey) {
    // No key configured yet — respond gracefully so the frontend falls back to heuristics only.
    res.status(200).json({ checked: false, reason: 'no_api_key_configured' });
    return;
  }

  try {
    const sbRes = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'nexus-cyber-awareness', clientVersion: '1.0.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!sbRes.ok) {
      res.status(200).json({ checked: false, reason: 'upstream_error' });
      return;
    }

    const data = await sbRes.json();
    const matches = data.matches || [];
    res.status(200).json({
      malicious: matches.length > 0,
      threatTypes: matches.map((m) => m.threatType),
    });
  } catch (e) {
    res.status(200).json({ checked: false, reason: 'network_error' });
  }
}
