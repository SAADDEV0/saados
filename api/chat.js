// This file runs on Vercel's server only — never in the browser.
// It reads GROQ_API_KEY from Vercel's Environment Variables and
// forwards the request to Groq, so the key is never exposed to users.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const { model, messages, temperature, max_tokens } = req.body || {};

  if (!model || !messages) {
    return res.status(400).json({ error: { message: 'Missing model or messages' } });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const data = await groqRes.json();
    // Pass Groq's status straight through so your existing error handling
    // (fallback models, error messages) keeps working exactly as before.
    return res.status(groqRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message || 'Proxy error' } });
  }
}
