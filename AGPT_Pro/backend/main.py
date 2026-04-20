import os
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

CHAT_API_URL = "https://api.chatanywhere.cn/v1/chat/completions"
API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="NOMO GPT Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@app.post("/chat")
async def chat(payload: ChatRequest):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured")

    body = {"model": "gpt-3.5-turbo", "messages": [msg.model_dump() for msg in payload.messages]}
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(CHAT_API_URL, json=body, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Upstream AI API error: {exc}") from exc

    try:
        reply = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="Invalid response from AI API") from exc

    return {"reply": reply}
