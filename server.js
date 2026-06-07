/**
 * SpineIQ — Secure Backend Proxy
 * Forwards AI report requests to Anthropic API.
 * API key is stored in environment variable — never in frontend code.
 */

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ─────────────────────────────────────────────────────
app.use(express.json());

// Allow all origins (safe since this proxy only calls Anthropic)
app.use(cors());

// ── HEALTH CHECK ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'SpineIQ API proxy running', version: '1.0.0' });
});

// ── REPORT GENERATION PROXY ───────────────────────────────────────
app.post('/api/generate-report', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 1200,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error.' });
    }

    const text = data.content?.map(b => b.text || '').join('') || '';
    res.json({ report: text });

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Failed to contact Anthropic API: ' + err.message });
  }
});

// ── START ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`SpineIQ proxy running on port ${PORT}`);
});
