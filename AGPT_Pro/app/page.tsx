"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import ParticleBackground from "@/components/ParticleBackground";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000/chat";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello. I am NOMO GPT. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data: { reply: string } = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong while contacting the AI service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f0f0f] text-white">
      <ParticleBackground />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">NOMO GPT</h1>
          <p className="mt-2 text-sm text-zinc-400">Smart AI Assistant</p>
        </header>

        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#141414]/95">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-zinc-800"
                    : "mr-auto bg-zinc-700 text-zinc-100"
                }`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="mr-auto inline-flex items-center gap-1 rounded-2xl bg-zinc-700 px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300" />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-zinc-800 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-xl bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
