# SpineIQ Backend — Secure API Proxy

A lightweight Express.js proxy that securely forwards AI report generation requests from the SpineIQ frontend to the Anthropic API. The API key never touches the frontend or GitHub.

---

## How it works

```
Browser (GitHub Pages)
  → POST /api/generate-report
    → SpineIQ Backend (this server)
      → Anthropic Claude API
    ← { report: "..." }
  ← Report displayed to user
```

---

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env

# 3. Add your Anthropic API key to .env
# Open .env and set: ANTHROPIC_API_KEY=sk-ant-api03-...

# 4. Start the server
npm start

# Server runs on http://localhost:3000
```

---

## Deploy to Render (free hosting)

1. Push this folder to a GitHub repo (e.g. `spineiq-backend`)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
6. Deploy — Render gives you a URL like `https://spineiq-backend.onrender.com`
7. Update the frontend `app.js` to use that URL

---

## API Endpoints

### `GET /`
Health check.
```json
{ "status": "SpineIQ API proxy running", "version": "1.0.0" }
```

### `POST /api/generate-report`
Generate an AI clinical report.

**Request body:**
```json
{ "prompt": "..." }
```

**Response:**
```json
{ "report": "1. PATIENT SUMMARY\n..." }
```

---

## Security

- API key stored in environment variable only — never in code
- CORS restricted to allowed origins (GitHub Pages + localhost)
- No patient data is stored — requests are forwarded and discarded
