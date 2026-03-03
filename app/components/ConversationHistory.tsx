"use client";

import type { Message } from "../types";
import ChatBubble from "./ChatBubble";
import LoadingDots from "./LoadingDots";

interface ConversationHistoryProps {
    messages: Message[];
    isProcessing: boolean;
}

export default function ConversationHistory({
    messages,
    isProcessing,
}: ConversationHistoryProps) {
    if (messages.length === 0 && !isProcessing) return null;

    return (
        <div className="w-full max-w-xl flex flex-col gap-4 px-4 pb-8">
            {/* Divider */}
            <div className="flex items-center gap-3 mb-2">
                <div
                    className="flex-1 h-px"
                    style={{ background: "var(--aura-border)" }}
                />
                <span
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: "var(--aura-text-muted)", opacity: 0.6 }}
                >
                    Conversation
                </span>
                <div
                    className="flex-1 h-px"
                    style={{ background: "var(--aura-border)" }}
                />
            </div>

            {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Processing indicator */}
            {isProcessing && (
                <div className="flex justify-start animate-fade-in-up">
                    <div
                        className="px-5 py-4 rounded-3xl"
                        style={{
                            background: "var(--aura-surface)",
                            border: "1px solid var(--aura-border)",
                            borderRadius: "20px 20px 20px 6px",
                            boxShadow: "0 2px 12px rgba(47,42,36,0.05)",
                        }}
                    >
                        <p
                            className="text-xs font-semibold uppercase tracking-widest mb-2"
                            style={{ color: "var(--aura-accent)", letterSpacing: "0.1em" }}
                        >
                            Aura
                        </p>
                        <LoadingDots />
                    </div>
                </div>
            )}
        </div>
    );
}
