// AuraCare shared types

export type ToneLevel = "gen-z" | "balanced" | "grounded";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface ToneOption {
    value: ToneLevel;
    label: string;
    description: string;
    sliderPosition: number; // 0, 1, 2
}

export const TONE_OPTIONS: ToneOption[] = [
    {
        value: "gen-z",
        label: "Gen Z Heavy",
        sliderPosition: 0,
        description:
            "I keep it real and casual — talking like a friend who actually gets you.",
    },
    {
        value: "balanced",
        label: "Balanced",
        sliderPosition: 1,
        description:
            "A calm middle ground — warm and empathetic, with a grounded voice.",
    },
    {
        value: "grounded",
        label: "Grounded / Serious",
        sliderPosition: 2,
        description:
            "Thoughtful and composed — steady support with measured, careful words.",
    },
];
