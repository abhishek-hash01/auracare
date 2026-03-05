"use client";

import { type AppState } from "../hooks/useAuraCare";
import { type ToneLevel } from "../types";

// Tone-based mic gradient
const TONE_COLORS: Record<ToneLevel, { from: string; to: string }> = {
    "gen-z": { from: "#B88040", to: "#8B6030" }, // warmer amber
    "balanced": { from: "#A07848", to: "#7A5C34" }, // neutral brown
    "grounded": { from: "#8A6640", to: "#604E2E" }, // darker, muted
};

// Tone-based breathing speed (gen-z = energetic, grounded = slow and steady)
const TONE_BREATHE: Record<ToneLevel, string> = {
    "gen-z": "3.5s",
    "balanced": "5s",
    "grounded": "7s",
};

// Deterministic bar heights
const IDLE_H = [6, 9, 13, 9, 6, 8, 11, 8, 6, 10, 14, 10, 6, 8, 12, 8, 6, 9, 13, 9, 6, 8, 11, 8];
const LISTEN_H = [9, 16, 22, 16, 9, 11, 18, 11, 9, 16, 24, 16, 9, 11, 20, 11, 9, 16, 22, 16, 9, 11, 18, 11];

interface MicButtonProps {
    appState: AppState;
    tone: ToneLevel;
    onMicPress: () => void;
}

export default function MicButton({ appState, tone, onMicPress }: MicButtonProps) {
    const isListening = appState === "listening";
    const isProcessing = ["transcribing", "understanding", "responding", "processing"].includes(appState);
    const isIdle = !isListening && !isProcessing;

    const { from, to } = TONE_COLORS[tone];
    const breatheSpeed = TONE_BREATHE[tone];

    // Listening ring animation — 3 staggered soft rings radiating outward
    const ringOpacity = isListening ? 1 : 0;

    return (
        <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>

            {/* ── SVG layer ── */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300" fill="none">

                {/* Outermost dashed orbit */}
                <circle cx="150" cy="150" r="144"
                    stroke="rgba(139,111,71,0.14)" strokeWidth="1"
                    strokeDasharray="3 9" strokeLinecap="round"
                    style={{ transformOrigin: "150px 150px", animation: "spin-slow 40s linear infinite" }} />

                {/* Counter-rotating inner orbit */}
                <circle cx="150" cy="150" r="122"
                    stroke="rgba(139,111,71,0.08)" strokeWidth="1"
                    strokeDasharray="2 11" strokeLinecap="round"
                    style={{ transformOrigin: "150px 150px", animation: "spin-slow 28s linear infinite reverse" }} />

                {/* Solid inner reference ring — brighter on listening */}
                <circle cx="150" cy="150" r="100"
                    stroke={isListening ? "rgba(192,133,106,0.55)" : "rgba(139,111,71,0.17)"}
                    strokeWidth={isListening ? "1.5" : "1"}
                    style={{ transition: "stroke 0.6s ease" }} />


                {/* 24 radial waveform bars */}
                {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
                    const r0 = 105;
                    const barH = isListening ? LISTEN_H[i] : IDLE_H[i];
                    const x1 = (150 + r0 * Math.cos(angle)).toFixed(3);
                    const y1 = (150 + r0 * Math.sin(angle)).toFixed(3);
                    const x2 = (150 + (r0 + barH) * Math.cos(angle)).toFixed(3);
                    const y2 = (150 + (r0 + barH) * Math.sin(angle)).toFixed(3);
                    return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={isListening ? "rgba(192,133,106,0.75)" : "rgba(139,111,71,0.26)"}
                            strokeWidth={isListening ? "2" : "1.5"} strokeLinecap="round"
                            style={{
                                transition: "stroke 0.5s ease",
                                animation: isListening
                                    ? `waveform ${(tone === "gen-z" ? 0.55 : tone === "grounded" ? 0.95 : 0.75) + (i % 5) * 0.09}s ease-in-out infinite alternate`
                                    : "none",
                                transformOrigin: `${x1}px ${y1}px`,
                            }} />
                    );
                })}

                {/* Ambient glow disc — rose tint when listening */}
                <circle cx="150" cy="150" r="86"
                    fill={isListening ? "rgba(192,133,106,0.14)" : "rgba(184,148,100,0.08)"}
                    style={{ transition: "fill 0.7s ease" }} />
            </svg>

            {/* ── Breathing wrapper — speed controlled by tone ── */}
            <div style={{
                animation: isIdle
                    ? `mic-idle-breathe ${breatheSpeed} ease-in-out infinite`
                    : "none",
            }}>
                <button
                    onClick={onMicPress}
                    disabled={isProcessing}
                    aria-label={isListening ? "Stop listening" : "Start talking to Aura"}
                    className="relative z-10 flex items-center justify-center rounded-full focus:outline-none disabled:cursor-not-allowed"
                    style={{
                        width: 104,
                        height: 104,
                        background: `linear-gradient(145deg, ${from}, ${to})`,
                        boxShadow: isListening
                            ? `0 0 0 10px rgba(192,133,106,0.12), 0 14px 44px rgba(192,133,106,0.50), inset 0 1px 0 rgba(255,255,255,0.18)`
                            : `0 8px 32px rgba(160,120,72,0.40), inset 0 1px 0 rgba(255,255,255,0.13)`,
                        transition: "background 0.7s ease, box-shadow 0.5s ease",
                    }}
                >
                    {isListening ? <SoundWaveIcon tone={tone} /> : isProcessing ? <ProcessingIcon /> : <MicIcon />}
                </button>
            </div>
        </div>
    );
}

function MicIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={34} height={34} viewBox="0 0 24 24"
            fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M19 10a7 7 0 01-14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
    );
}

function SoundWaveIcon({ tone }: { tone: ToneLevel }) {
    const heights = [10, 18, 26, 32, 26, 18, 10];
    const speed = tone === "gen-z" ? 0.65 : tone === "grounded" ? 1.05 : 0.85;
    return (
        <div className="flex items-center gap-[3px]">
            {heights.map((h, i) => (
                <span key={i} className="rounded-full bg-white"
                    style={{
                        width: 3, height: h,
                        animation: `waveform ${speed}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.09}s`,
                        opacity: 0.92,
                    }} />
            ))}
        </div>
    );
}

function ProcessingIcon() {
    return (
        <div className="flex items-center gap-[5px]">
            {[0, 1, 2].map((i) => (
                <span key={i} className="rounded-full bg-white"
                    style={{ width: 7, height: 7, animation: "dot-bounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
            ))}
        </div>
    );
}
