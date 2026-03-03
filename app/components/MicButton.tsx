"use client";

import { type AppState } from "../hooks/useAuraCare";

interface MicButtonProps {
    appState: AppState;
    onMicPress: () => void;
}

export default function MicButton({ appState, onMicPress }: MicButtonProps) {
    const isListening = appState === "listening";
    const isProcessing = appState === "processing";
    const isDisabled = isProcessing;

    return (
        <div className="relative flex items-center justify-center">
            {/* Outer glow rings when listening */}
            {isListening && (
                <>
                    <span
                        className="absolute rounded-full animate-glow-ring"
                        style={{
                            width: 180,
                            height: 180,
                            background: "transparent",
                        }}
                    />
                    <span
                        className="absolute rounded-full animate-glow-ring"
                        style={{
                            width: 180,
                            height: 180,
                            animationDelay: "0.5s",
                            background: "transparent",
                        }}
                    />
                </>
            )}

            {/* Main button */}
            <button
                onClick={onMicPress}
                disabled={isDisabled}
                aria-label={isListening ? "Stop listening" : "Start talking"}
                className="relative z-10 flex items-center justify-center rounded-full transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    width: isListening ? 112 : 96,
                    height: isListening ? 112 : 96,
                    background: "var(--aura-accent)",
                    boxShadow: isListening
                        ? "0 8px 32px rgba(139,111,71,0.45), 0 0 0 6px rgba(139,111,71,0.12)"
                        : "0 4px 20px rgba(139,111,71,0.28)",
                }}
            >
                {isListening ? (
                    /* Animated sound wave lines when listening */
                    <SoundWaveIcon className="animate-mic-pulse" />
                ) : isProcessing ? (
                    <ProcessingIcon />
                ) : (
                    <MicIcon />
                )}
            </button>
        </div>
    );
}

function MicIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={32}
            height={32}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M19 10a7 7 0 01-14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
    );
}

function SoundWaveIcon({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-[3px] ${className ?? ""}`}>
            {[14, 22, 28, 22, 14].map((h, i) => (
                <span
                    key={i}
                    className="rounded-full bg-white"
                    style={{
                        width: 3,
                        height: h,
                        animation: `dot-bounce 1.1s ease-in-out infinite`,
                        animationDelay: `${i * 0.11}s`,
                        opacity: 0.9,
                    }}
                />
            ))}
        </div>
    );
}

function ProcessingIcon() {
    return (
        <div className="flex items-center gap-[4px]">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="rounded-full bg-white"
                    style={{
                        width: 6,
                        height: 6,
                        animation: `dot-bounce 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                        opacity: 0.85,
                    }}
                />
            ))}
        </div>
    );
}
