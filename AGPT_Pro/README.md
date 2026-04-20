# NOMO GPT

Custom ChatGPT-like full-stack app with:
- Next.js (App Router) + Tailwind frontend
- Three.js lightweight particle background
- FastAPI backend with `POST /chat`
- ChatAnywhere OpenAI-compatible API integration

## Project Structure

- `app/page.tsx` - main chat UI and client-side chat flow
- `components/ThreeBackground.tsx` - non-blocking Three.js background
- `backend/main.py` - FastAPI server and `/chat` endpoint
- `backend/requirements.txt` - Python dependencies

## 1) Frontend Setup (Next.js)

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000).

## 2) Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## 3) Environment Variables

In `backend/.env`:

```env
OPENAI_API_KEY=your_chatanywhere_api_key_here
```

In `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000/chat
```

## API Behavior

- Endpoint: `POST /chat`
- Request body:

```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

- Response body:

```json
{
  "reply": "Hi! How can I help?"
}
```
