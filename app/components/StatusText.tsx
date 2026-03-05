"use client";

import { useState, useEffect } from "react";
import { type AppState } from "../hooks/useAuraCare";

interface StatusTextProps {
    appState: AppState;
}

// Rotating messages for the listening state
const LISTENING_PHRASES = ["Listening…", "Go on…", "I'm here.", "Tell me more."];
const PROCESSING_TEXT = "Got it. Give me a second.";

export default function StatusText({ appState }: StatusTextProps) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    // Cycle through phrases when listening
    useEffect(() => {
        if (appState !== "listening") {
            setPhraseIndex(0);
            return;
        }

        const cycle = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setPhraseIndex((i) => (i + 1) % LISTENING_PHRASES.length);
                setVisible(true);
            }, 300);
        }, 2600);

        return () => clearInterval(cycle);
    }, [appState]);

    const getText = () => {
        if (appState === "listening") return LISTENING_PHRASES[phraseIndex];
        if (appState === "transcribing") return "Transcribing...";
        if (appState === "understanding") return "Understanding...";
        if (appState === "responding") return "Responding...";
        if (appState === "processing") return "Processing...";
        if (appState === "responded") return "Tap to speak again";
        return "Tap to begin";
    };

    return (
        <p
            className="text-sm font-medium tracking-wide"
            style={{
                color: appState === "listening" ? "var(--aura-rose)" : "var(--aura-text-muted)",
                transition: "opacity 0.3s ease, color 0.4s ease",
                opacity: visible ? 1 : 0,
                minHeight: "1.4em",
            }}
        >
            {getText()}
        </p>
    );
}
