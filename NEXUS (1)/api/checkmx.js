// Vercel serverless function — /api/checkmx?domain=...
// Confirms a domain has a real mail server (MX record) using Google's public DNS-over-HTTPS API.
// No API key needed for this one.

export default async function handler(req, res) {
  const domain = req.query.domain;
  if (!domain) {
    res.status(400).json({ error: 'Missing domain parameter' });
    return;
  }

  try {
    const dnsRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
    const data = await dnsRes.json();
    const hasMX = !!(data.Answer && data.Answer.length > 0);
    res.status(200).json({ hasMX });
  } catch (e) {
    res.status(200).json({ checked: false, reason: 'network_error' });
  }
}
