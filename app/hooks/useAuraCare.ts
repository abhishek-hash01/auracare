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

        setAppState("processing");

        // Placeholder: simulate sending to /api/chat
        try {
            await new Promise((res) => setTimeout(res, 2000));

            const placeholderUserText = "I've been feeling a bit overwhelmed lately.";
            const placeholderResponse =
                "It sounds like you're carrying a lot right now. That's completely understandable. Sometimes our minds just need a moment to breathe before we can find clarity again. You're not alone in this.";

            const userMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: placeholderUserText,
                timestamp: new Date(),
            };

            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: placeholderResponse,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg, assistantMsg]);

            // Placeholder TTS trigger
            speakText(placeholderResponse);

            setAppState("responded");
        } catch {
            setAppState("idle");
        }
    }, [appState]);

    const resetToIdle = useCallback(() => {
        setAppState("idle");
    }, []);

    return {
        appState,
        isListening,
        isProcessing,
        selectedTone,
        setSelectedTone,
        messages,
        startListening,
        stopListening,
        resetToIdle,
    };
}

/** Placeholder text-to-speech function */
function speakText(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
}
