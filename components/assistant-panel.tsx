"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";
import { Bot, User, Trash2, Send, ShieldCheck } from "lucide-react";

type Message = { role: "worker" | "assistant"; text: string };

const suggestions = [
  "Was my Swiggy fare fair?",
  "What is the Karnataka gig worker floor rate?",
  "Deduction explanation request template"
];

export function AssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Ask about a fare, deduction, weekly earnings, route safety, or complaint draft. I use your authenticated records only." }
  ]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function send(textToSend?: string) {
    const current = (textToSend || message).trim();
    if (!current || sending) return;

    setSending(true);
    if (!textToSend) setMessage("");

    // Add user message
    setMessages((items) => [...items, { role: "worker", text: current }]);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: current, jobId: current.toLowerCase().includes("swiggy") ? "job-101" : undefined })
      });
      const payload = await response.json();
      setMessages((items) => [...items, { role: "assistant", text: payload.ok ? payload.data.answer : payload.error.message }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", text: "Sorry, I could not complete that request." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      {/* Scrollable messages box */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-[#F7F7F8] p-4 space-y-3 min-h-0">
        {messages.map((item, index) => {
          const isWorker = item.role === "worker";
          return (
            <div key={index} className={`flex items-start gap-3 max-w-[85%] ${isWorker ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              {/* Avatar circle */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${isWorker ? "bg-primary" : "bg-[#202124]"}`}>
                {isWorker ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className={`rounded-2xl p-4 text-xs font-semibold leading-relaxed shadow-sm ${
                isWorker 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white text-[#202124] rounded-tl-none border border-[#E7E7EA]"
              }`}>
                {item.text}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-semibold px-3 animate-pulse">
            <Bot size={14} />
            <span>AI Assistant is writing...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts list */}
      {messages.length === 1 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Suggested prompts</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((text) => (
              <button
                key={text}
                onClick={() => send(text)}
                type="button"
                className="rounded-xl border border-[#E7E7EA] bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 text-left transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel row */}
      <div className="flex gap-2">
        <input
          className={inputClass + " flex-1 min-h-12 focus:ring-primary/10"}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && send()}
          placeholder="Ask a question..."
          aria-label="Assistant message"
        />
        <button
          className="min-h-12 w-12 rounded-xl bg-primary hover:bg-[#D84315] flex items-center justify-center text-white shadow-sm shadow-primary/10 transition-colors"
          onClick={() => send()}
          disabled={sending}
          type="button"
        >
          <Send size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck size={14} className="text-emerald-500" />
          General information only — not legal advice.
        </span>
        <button
          className="inline-flex items-center gap-1 font-bold text-slate-400 hover:text-red-600 transition-colors"
          onClick={() => setMessages([{ role: "assistant", text: "Ask about a fare, deduction, weekly earnings, route safety, or complaint draft." }])}
          type="button"
        >
          <Trash2 size={14} /> Clear chat
        </button>
      </div>
    </div>
  );
}
