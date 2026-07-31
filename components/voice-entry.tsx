"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bot, Mic, MicOff, RefreshCcw, Sparkles, Trash2 } from "lucide-react";
import { JobForm } from "@/components/job-form";
import { inputClass } from "@/components/ui";
import type { JobInput } from "@/lib/validations";

type SpeechLanguage = "en-IN" | "hi-IN" | "kn-IN";

type BrowserSpeechRecognitionAlternative = {
  transcript: string;
};

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  0: BrowserSpeechRecognitionAlternative;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult;
  };
};

type BrowserSpeechRecognitionErrorEvent = {
  error: string;
};

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

const languages: Array<{ label: string; value: SpeechLanguage }> = [
  { label: "English", value: "en-IN" },
  { label: "Hindi", value: "hi-IN" },
  { label: "Kannada", value: "kn-IN" }
];

const exampleTranscript =
  "I completed a Swiggy food delivery for 112 rupees. The trip was 7.4 kilometres and took 34 minutes. There was a deduction of 15 rupees and I waited for 8 minutes.";

function recognitionErrorMessage(error: string) {
  if (error === "not-allowed" || error === "service-not-allowed") return "Microphone permission was denied. Type or paste your job description below.";
  if (error === "no-speech") return "No speech was detected. Try again or use the typed transcript box.";
  if (error === "audio-capture") return "Audio capture is unavailable on this device. The typed fallback still works.";
  if (error === "network") return "Speech recognition had a network problem. Please retry or type the transcript.";
  if (error === "aborted") return "Listening stopped.";
  return "Speech recognition stopped unexpectedly. The typed fallback still works.";
}

export function VoiceEntry({ initialLanguage = "en-IN" }: { initialLanguage?: SpeechLanguage }) {
  const [language, setLanguage] = useState<SpeechLanguage>(initialLanguage);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [parsed, setParsed] = useState<Partial<JobInput> | null>(null);
  const [message, setMessage] = useState("Voice recognition is optional. Type or paste your job description below if your browser does not support it.");
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [secureEnough, setSecureEnough] = useState(true);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    setSupported(Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition));
    setSecureEnough(window.isSecureContext || window.location.hostname === "localhost");
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  function clearRecognitionTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function stopListening() {
    clearRecognitionTimeout();
    recognitionRef.current?.stop();
    setListening(false);
    setInterimTranscript("");
  }

  function startListening() {
    setError("");
    setMessage("");
    if (!secureEnough) {
      setError("Microphone access requires localhost or an HTTPS deployment. Type or paste your job description below.");
      return;
    }
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setSupported(false);
      setError("Voice recognition is not supported in this browser. Type or paste your job description below.");
      return;
    }
    if (listening) return;

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setListening(true);
      timeoutRef.current = setTimeout(() => {
        setError("No speech was detected. Try again or use the typed transcript box.");
        stopListening();
      }, 15000);
    };
    recognition.onresult = (event) => {
      clearRecognitionTimeout();
      let finalText = "";
      let interimText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) {
        setTranscript((current) => `${current}${current ? " " : ""}${finalText.trim()}`.trim());
      }
      setInterimTranscript(interimText.trim());
    };
    recognition.onerror = (event) => {
      setError(recognitionErrorMessage(event.error));
      clearRecognitionTimeout();
      setListening(false);
    };
    recognition.onend = () => {
      clearRecognitionTimeout();
      setListening(false);
      setInterimTranscript("");
    };

    try {
      recognition.start();
    } catch {
      setError("Speech recognition could not start. Please retry or type the transcript.");
      setListening(false);
    }
  }

  async function parse() {
    if (parsing) return;
    if (transcript.trim().length < 5) {
      setError("Add at least a short job description before extracting details.");
      return;
    }
    setParsing(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/jobs/voice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript, language })
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error?.message ?? "Could not parse transcript.");
      setParsed(payload.data);
      setMessage("Transcript parsed successfully. Please review and edit the fields below.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An unexpected error occurred while parsing.");
    } finally {
      setParsing(false);
    }
  }

  function clearTranscript() {
    stopListening();
    setTranscript("");
    setInterimTranscript("");
    setParsed(null);
    setError("");
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <label className="grid gap-1.5 text-sm font-semibold text-[#202124]">
          <span>Language</span>
          <select className={inputClass} value={language} onChange={(event) => setLanguage(event.target.value as SpeechLanguage)} disabled={listening}>
            {languages.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={startListening}
            disabled={listening}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm shadow-primary/10 transition-colors hover:bg-[#D84315] disabled:opacity-60"
          >
            <Mic size={16} /> Start listening
          </button>
          <button
            type="button"
            onClick={stopListening}
            disabled={!listening}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <MicOff size={16} /> Stop
          </button>
          <button
            type="button"
            onClick={() => {
              setTranscript(exampleTranscript);
              setParsed(null);
              setError("");
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCcw size={16} /> Use example
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-[#F7F7F8] p-4 text-sm font-semibold text-slate-600">
        {listening ? (
          <span className="inline-flex items-center gap-2 text-emerald-700">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            Listening{interimTranscript ? `: ${interimTranscript}` : "..."}
          </span>
        ) : supported ? (
          "Ready to listen on supported secure browsers. The transcript remains editable."
        ) : (
          "Voice recognition is not supported in this browser. Type or paste your job description below."
        )}
      </div>

      {!secureEnough ? <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Microphone access requires localhost or HTTPS. Typed extraction still works.</div> : null}

      <label className="grid gap-2 text-sm font-semibold text-[#202124]">
        <span>Editable transcript</span>
        <textarea
          className={`${inputClass} min-h-32 w-full focus:ring-primary/10`}
          value={transcript}
          onChange={(event) => {
            setTranscript(event.target.value);
            setParsed(null);
          }}
          placeholder="Speak, type, or paste your job details here..."
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={parse}
          disabled={parsing || transcript.trim().length < 5}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm shadow-primary/10 transition-all duration-200 hover:bg-[#D84315] disabled:opacity-60"
          type="button"
        >
          <Sparkles size={16} /> {parsing ? "Extracting details..." : "Extract job details"}
        </button>
        <button
          onClick={clearTranscript}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          type="button"
        >
          <Trash2 size={16} /> Clear transcript
        </button>
      </div>

      {message ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          <Bot size={16} className="shrink-0 text-emerald-700" />
          <span>{message}</span>
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-900">
          <Bot size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {parsed ? (
        <div className="border-t border-[#E7E7EA] pt-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-bold uppercase tracking-wide text-[#202124]">Extracted job parameters</p>
          </div>
          <JobForm captureMethod="voice" initialValues={parsed} />
        </div>
      ) : null}
    </div>
  );
}
