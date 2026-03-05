"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, ToneLevel } from "../types";

export type AppState = "idle" | "listening" | "transcribing" | "understanding" | "responding" | "processing" | "responded";

export function useAuraCare() {
    const [appState, setAppState] = useState<AppState>("idle");
    const [selectedTone, setSelectedTone] = useState<ToneLevel>("balanced");
    const [messages, setMessages] = useState<Message[]>([]);

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const currentAudio = useRef<HTMLAudioElement | null>(null);
    const maxRecordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isListening = appState === "listening";
    const isProcessing = ["transcribing", "understanding", "responding", "processing"].includes(appState);

    const startListening = useCallback(async () => {
        try {
            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = { mimeType: "audio/webm;codecs=opus" };
            const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);

            mediaRecorder.current = recorder;
            audioChunks.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: recorder.mimeType || "audio/webm" });
                await _processAudioBlob(audioBlob, selectedTone, messages, setAppState, setMessages, currentAudio);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setAppState("listening");

            // Sarvam STT has a strict 30-second limit. Enforce a 29s auto-stop.
            if (maxRecordTimer.current) clearTimeout(maxRecordTimer.current);
            maxRecordTimer.current = setTimeout(() => {
                if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
                    mediaRecorder.current.stop();
                }
            }, 29000);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            setAppState("idle");
        }
    }, [selectedTone, messages]);

    const stopListening = useCallback(() => {
        if (appState !== "listening" || !mediaRecorder.current) return;
        if (maxRecordTimer.current) clearTimeout(maxRecordTimer.current);
        mediaRecorder.current.stop();
        // The processAudioBlob is triggered in onstop
    }, [appState]);

    const processPrompt = useCallback(async (prompt: string) => {
        // Direct processing skipped. In a real scenario we could send text directly.
        // Left empty as it's primarily used for simulated actions/demos.
    }, []);

    const resetToIdle = useCallback(() => {
        setAppState("idle");
        if (maxRecordTimer.current) clearTimeout(maxRecordTimer.current);
        if (currentAudio.current) {
            currentAudio.current.pause();
            currentAudio.current = null;
        }
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
        processPrompt,
        resetToIdle,
    };
}

async function _processAudioBlob(
    audioBlob: Blob,
    tone: ToneLevel,
    messages: Message[],
    setAppState: (s: AppState) => void,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    currentAudio: React.MutableRefObject<HTMLAudioElement | null>
) {
    try {
        setAppState("transcribing");

        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");
        formData.append("tone", tone);
        formData.append("messages", JSON.stringify(messages));

        // Let's implement pseudo-stages while we wait for the fetch to resolve.
        const stateTimer1 = setTimeout(() => setAppState("understanding"), 1500);
        const stateTimer2 = setTimeout(() => setAppState("responding"), 3000);

        const res = await fetch("/api/processVoice", {
            method: "POST",
            body: formData,
        });

        clearTimeout(stateTimer1);
        clearTimeout(stateTimer2);

        if (!res.ok) {
            let errorText = res.statusText;
            try {
                const errData = await res.json();
                errorText = errData.details || errData.error || errorText;
            } catch {
                errorText = await res.text();
            }
            throw new Error(`Pipeline failed: ${errorText}`);
        }

        const generatedText = decodeURIComponent(res.headers.get("X-Response-Text") || "I'm sorry, I couldn't respond.");
        const userTranscript = decodeURIComponent(res.headers.get("X-User-Transcript") || "Audio message");
        const audioBuffer = await res.arrayBuffer();

        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "user", content: userTranscript, timestamp: new Date() },
            { id: crypto.randomUUID(), role: "assistant", content: generatedText, timestamp: new Date() }
        ]);

        // Play audio
        const blob = new Blob([audioBuffer], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio.current = audio;

        audio.onended = () => {
            setAppState("idle");
        };

        await audio.play();
        setAppState("responded");

    } catch (e) {
        console.error("Audio processing failed", e);
        setAppState("idle");
    }
}
