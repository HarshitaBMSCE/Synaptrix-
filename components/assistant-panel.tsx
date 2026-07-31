"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";

type Message = { role: "worker" | "assistant"; text: string };

export function AssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Ask about a fare, deduction, weekly earnings, route safety, or complaint draft. I use your authenticated records only." }
  ]);
  const [message, setMessage] = useState("Was my Swiggy fare fair?");

  async function send() {
    const current = message.trim();
    if (!current) return;
    setMessages((items) => [...items, { role: "worker", text: current }]);
    setMessage("");
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: current, jobId: current.toLowerCase().includes("swiggy") ? "job-101" : undefined })
    });
    const payload = await response.json();
    setMessages((items) => [...items, { role: "assistant", text: payload.ok ? payload.data.answer : payload.error.message }]);
  }

  return (
    <div className="grid gap-4">
      <div className="grid max-h-[60vh] gap-3 overflow-auto rounded-lg border border-border bg-muted p-3">
        {messages.map((item, index) => (
          <div key={index} className={`rounded-lg p-3 text-sm leading-6 ${item.role === "worker" ? "ml-auto max-w-[85%] bg-primary text-primary-foreground" : "mr-auto max-w-[92%] bg-white"}`}>
            {item.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className={inputClass + " flex-1"} value={message} onChange={(event) => setMessage(event.target.value)} aria-label="Assistant message" />
        <button className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground" onClick={send} type="button">Send</button>
      </div>
      <button className="justify-self-start text-sm font-semibold text-primary" onClick={() => setMessages([])} type="button">Clear chat</button>
    </div>
  );
}
