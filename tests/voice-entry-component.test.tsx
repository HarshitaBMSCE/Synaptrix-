import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { VoiceEntry } from "@/components/voice-entry";

afterEach(() => cleanup());

describe("VoiceEntry browser fallback", () => {
  it("shows the typed fallback when speech recognition is unavailable", async () => {
    const speechWindow = window as Window & {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    speechWindow.SpeechRecognition = undefined;
    speechWindow.webkitSpeechRecognition = undefined;

    render(<VoiceEntry initialLanguage="en-IN" />);

    expect(await screen.findByText("Voice recognition is not supported in this browser. Type or paste your job description below.")).toBeTruthy();
    expect(screen.getByPlaceholderText("Speak, type, or paste your job details here...")).toBeTruthy();
  });
});
