"use client";

import type { Message } from "../types";

interface ChatBubbleProps {
    message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
    const isAssistant = message.role === "assistant";

    return (
        <div
            className={`w-full flex animate-fade-in-up ${isAssistant ? "justify-start" : "justify-end"
                }`}
        >
            <div
                className="max-w-[85%] px-5 py-4 rounded-3xl"
                style={{
                    background: isAssistant ? "var(--aura-surface)" : "rgba(139,111,71,0.10)",
                    border: `1px solid var(--aura-border)`,
                    color: "var(--aura-text)",
                    borderRadius: isAssistant
                        ? "20px 20px 20px 6px"
                        : "20px 20px 6px 20px",
                    boxShadow: "0 2px 12px rgba(47,42,36,0.05)",
                }}
            >
                {/* Speaker label */}
                <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--aura-accent)", letterSpacing: "0.1em" }}
                >
                    {isAssistant ? "Aura" : "You"}
                </p>

                {/* Message content */}
                <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--aura-text)", fontWeight: 400 }}
                >
                    {message.content}
                </p>
            </div>
        </div>
    );
}
