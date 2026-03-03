"use client";

import { TONE_OPTIONS, type ToneLevel } from "../types";

interface ToneSliderProps {
    value: ToneLevel;
    onChange: (tone: ToneLevel) => void;
}

// Short personality labels (displayed below the track)
const PERSONALITY_LABELS: Record<ToneLevel, string> = {
    "gen-z": "Casual & Real",
    "balanced": "Warm & Steady",
    "grounded": "Calm & Direct",
};

export default function ToneSlider({ value, onChange }: ToneSliderProps) {
    const currentIndex = TONE_OPTIONS.findIndex((t) => t.value === value);
    const currentOption = TONE_OPTIONS[currentIndex];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idx = Number(e.target.value);
        onChange(TONE_OPTIONS[idx].value);
    };

    return (
        <div className="w-full flex flex-col gap-4">

            {/* Label row */}
            <div className="flex justify-between items-center">
                {TONE_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => onChange(opt.value)}
                        className="text-xs text-center leading-tight transition-all duration-200"
                        style={{
                            color: value === opt.value ? "var(--aura-accent)" : "var(--aura-text-muted)",
                            fontWeight: value === opt.value ? 600 : 400,
                            opacity: value === opt.value ? 1 : 0.55,
                            background: "none",
                            border: "none",
                            padding: "2px 4px",
                            cursor: "pointer",
                        }}>
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Track */}
            <div className="relative w-full h-2 flex items-center">
                <div className="absolute w-full h-[2px] rounded-full" style={{ background: "var(--aura-border)" }} />
                <div className="absolute h-[2px] rounded-full transition-all duration-300"
                    style={{ width: `${(currentIndex / 2) * 100}%`, background: "var(--aura-accent)" }} />
                <input type="range" min={0} max={2} step={1} value={currentIndex} onChange={handleChange}
                    className="absolute w-full opacity-0 h-6 cursor-pointer" aria-label="Tone intensity" />
                {TONE_OPTIONS.map((opt) => (
                    <div key={opt.value}
                        className="absolute w-2.5 h-2.5 rounded-full border-[1.5px] transition-all duration-300"
                        style={{
                            left: `calc(${(opt.sliderPosition / 2) * 100}% - 5px)`,
                            background: opt.sliderPosition <= currentIndex ? "var(--aura-accent)" : "var(--aura-surface)",
                            borderColor: opt.sliderPosition <= currentIndex ? "var(--aura-accent)" : "var(--aura-border)",
                        }} />
                ))}
            </div>

            {/* Personality label + description */}
            <div key={value} className="flex flex-col items-center gap-1 animate-fade-in-up">
                <span className="text-xs font-semibold tracking-wide px-2.5 py-0.5 rounded-full"
                    style={{
                        background: "var(--aura-accent-pale)",
                        color: "var(--aura-accent)",
                        border: "1px solid rgba(139,111,71,0.15)",
                    }}>
                    {PERSONALITY_LABELS[value]}
                </span>
                <p className="text-center text-xs leading-snug mt-0.5"
                    style={{ color: "var(--aura-text-muted)", opacity: 0.7 }}>
                    {currentOption.description}
                </p>
            </div>
        </div>
    );
}
