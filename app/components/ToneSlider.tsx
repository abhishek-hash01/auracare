"use client";

import { TONE_OPTIONS, type ToneLevel } from "../types";

interface ToneSliderProps {
    value: ToneLevel;
    onChange: (tone: ToneLevel) => void;
}

export default function ToneSlider({ value, onChange }: ToneSliderProps) {
    const currentIndex = TONE_OPTIONS.findIndex((t) => t.value === value);
    const currentOption = TONE_OPTIONS[currentIndex];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const idx = Number(e.target.value);
        onChange(TONE_OPTIONS[idx].value);
    };

    return (
        <div className="w-full max-w-sm flex flex-col gap-4">
            {/* Label row */}
            <div className="flex justify-between items-center px-1">
                {TONE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className="text-xs font-medium transition-all duration-200 text-center leading-tight"
                        style={{
                            color:
                                value === opt.value
                                    ? "var(--aura-accent)"
                                    : "var(--aura-text-muted)",
                            fontWeight: value === opt.value ? 600 : 400,
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            padding: "2px 4px",
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Slider track */}
            <div className="relative w-full h-2 flex items-center">
                {/* Background track */}
                <div
                    className="absolute w-full h-[3px] rounded-full"
                    style={{ background: "var(--aura-border)" }}
                />
                {/* Active fill */}
                <div
                    className="absolute h-[3px] rounded-full transition-all duration-300"
                    style={{
                        width: `${(currentIndex / 2) * 100}%`,
                        background: "var(--aura-accent)",
                    }}
                />
                {/* HTML range input (transparent, on top) */}
                <input
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={currentIndex}
                    onChange={handleChange}
                    className="absolute w-full opacity-0 h-6 cursor-pointer"
                    aria-label="Tone intensity"
                />
                {/* Tick dots */}
                {TONE_OPTIONS.map((opt) => (
                    <div
                        key={opt.value}
                        className="absolute w-3 h-3 rounded-full border-2 transition-all duration-300"
                        style={{
                            left: `calc(${(opt.sliderPosition / 2) * 100}% - 6px)`,
                            background:
                                opt.sliderPosition <= currentIndex
                                    ? "var(--aura-accent)"
                                    : "var(--aura-surface)",
                            borderColor:
                                opt.sliderPosition <= currentIndex
                                    ? "var(--aura-accent)"
                                    : "var(--aura-border)",
                        }}
                    />
                ))}
            </div>

            {/* Helper text */}
            <p
                key={value}
                className="text-center text-xs leading-relaxed animate-fade-in-up"
                style={{ color: "var(--aura-text-muted)" }}
            >
                {currentOption.description}
            </p>
        </div>
    );
}
