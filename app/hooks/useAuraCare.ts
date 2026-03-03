"use client";

import { useState, useCallback } from "react";
import type { Message, ToneLevel } from "../types";

export type AppState = "idle" | "listening" | "processing" | "responded";

export function useAuraCare() {
    const [appState, setAppState] = useState<AppState>("idle");
    const [selectedTone, setSelectedTone] = useState<ToneLevel>("balanced");
    const [messages, setMessages] = useState<Message[]>([]);

    const isListening = appState === "listening";
    const isProcessing = appState === "processing";

    const startListening = useCallback(() => {
        setAppState("listening");
    }, []);

    const stopListening = useCallback(async () => {
        if (appState !== "listening") return;
        await _processText("I've been feeling a bit overwhelmed lately.", setAppState, setMessages, selectedTone);
    }, [appState, selectedTone]);

    /** Direct processing — skips the listening state entirely (used for tapped prompts) */
    const processPrompt = useCallback(async (prompt: string) => {
        if (appState === "listening" || appState === "processing") return;
        await _processText(prompt, setAppState, setMessages, selectedTone);
    }, [appState, selectedTone]);

    const resetToIdle = useCallback(() => setAppState("idle"), []);

    return {
        appState,
        isListening,
        isProcessing,
        selectedTone,
        setSelectedTone,
        messages,
        startListening,
        stopListening,
        processPrompt,
        resetToIdle,
    };
}

/* ────────────────────────────────────
   Shared processing helper
──────────────────────────────────── */
async function _processText(
    userText: string,
    setAppState: (s: AppState) => void,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    tone: ToneLevel,
) {
    setAppState("processing");

    const responsesByTone: Record<ToneLevel, string> = {
        "gen-z":
            "no fr, that sounds genuinely exhausting. you don't have to have it all figured out right now — i'm here. tell me more if you want.",
        "balanced":
            "It sounds like you're carrying a lot right now. That's completely understandable. Sometimes our minds just need a moment to breathe. You're not alone in this.",
        "grounded":
            "What you're feeling is real, and it matters. There's no need to rush through it. Take your time — I'm here to listen, without judgment.",
    };

    try {
        await new Promise((res) => setTimeout(res, 1600));

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: userText,
            timestamp: new Date(),
        };
        const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: responsesByTone[tone],
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        speakText(responsesByTone[tone]);
        setAppState("responded");
    } catch {
        setAppState("idle");
    }
}

function speakText(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1.0; u.volume = 1.0;
    window.speechSynthesis.speak(u);
}
