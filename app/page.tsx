"use client";

import { useRef, useEffect } from "react";
import { useAuraCare } from "./hooks/useAuraCare";
import MicButton from "./components/MicButton";
import ToneSlider from "./components/ToneSlider";
import StatusText from "./components/StatusText";
import ConversationHistory from "./components/ConversationHistory";

export default function HomePage() {
  const {
    appState,
    isProcessing,
    selectedTone,
    setSelectedTone,
    messages,
    startListening,
    stopListening,
  } = useAuraCare();

  const conversationRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (conversationRef.current && messages.length > 0) {
      conversationRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const handleMicPress = () => {
    if (appState === "listening") {
      stopListening();
    } else if (appState === "idle" || appState === "responded") {
      startListening();
    }
  };

  return (
    <main
      className="min-h-dvh w-full flex flex-col items-center"
      style={{ background: "var(--aura-bg)" }}
    >
      {/* Subtle background gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(250,247,242,0.6) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Sticky header */}
      <header
        className="sticky top-0 z-20 w-full flex justify-center px-6 pt-8 pb-4"
        style={{
          backdropFilter: "blur(12px)",
          background: "rgba(245,239,230,0.7)",
          borderBottom: "1px solid rgba(232,221,208,0.5)",
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <h1
            className="text-2xl font-light tracking-[0.25em] uppercase"
            style={{
              color: "var(--aura-accent)",
              fontFamily: "var(--font-dm-serif)",
              letterSpacing: "0.3em",
            }}
          >
            AuraCare
          </h1>
          <p
            className="text-xs tracking-widest uppercase font-medium"
            style={{ color: "var(--aura-text-muted)", letterSpacing: "0.15em" }}
          >
            Talk it out. I&apos;m listening.
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full flex-1 px-6">

        {/* Hero section — mic + slider */}
        <section className="flex flex-col items-center gap-10 py-16">
          {/* Mic button */}
          <MicButton appState={appState} onMicPress={handleMicPress} />

          {/* Status text */}
          <StatusText appState={appState} />

          {/* Divider */}
          <div
            className="w-px h-10"
            style={{ background: "var(--aura-border)" }}
            aria-hidden="true"
          />

          {/* Tone label */}
          <p
            className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: "var(--aura-text-muted)", opacity: 0.7 }}
          >
            Response Tone
          </p>

          {/* Tone slider */}
          <ToneSlider value={selectedTone} onChange={setSelectedTone} />
        </section>

        {/* Conversation history */}
        {(messages.length > 0 || isProcessing) && (
          <div ref={conversationRef} className="w-full flex flex-col items-center pb-20">
            <ConversationHistory
              messages={messages}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </div>

      {/* Empty state hint */}
      {messages.length === 0 && !isProcessing && (
        <div
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in-up"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <div
            className="w-8 h-[2px] rounded-full"
            style={{ background: "var(--aura-border)" }}
          />
          <p
            className="text-xs text-center max-w-[200px] leading-relaxed"
            style={{ color: "var(--aura-text-muted)", opacity: 0.5 }}
          >
            Voice only — no typing required
          </p>
        </div>
      )}
    </main>
  );
}
