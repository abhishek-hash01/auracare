"use client";

import type { AppState } from "../hooks/useAuraCare";

interface StatusTextProps {
    appState: AppState;
}

const STATUS_MAP: Record<AppState, string> = {
    idle: "Tap to begin",
    listening: "Listening...",
    processing: "Thinking...",
    responded: "Tap to speak again",
};

export default function StatusText({ appState }: StatusTextProps) {
    return (
        <p
            key={appState}
            className="text-sm font-medium tracking-wide animate-fade-in-up"
            style={{
                color:
                    appState === "listening"
                        ? "var(--aura-accent)"
                        : "var(--aura-text-muted)",
                transition: "color 0.3s ease",
            }}
        >
            {STATUS_MAP[appState]}
        </p>
    );
}
