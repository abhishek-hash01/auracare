"use client";

import { useRef, useEffect } from "react";
import { useAuraCare } from "./hooks/useAuraCare";
import MicButton from "./components/MicButton";
import ToneSlider from "./components/ToneSlider";
import StatusText from "./components/StatusText";
import ConversationHistory from "./components/ConversationHistory";

function Divider() {
  return <div className="w-full h-px" style={{ background: "var(--aura-border)" }} />;
}

const MOOD_PROMPTS = [
  "Why do I overthink literally everything?",
  "I feel something's wrong but I can't explain it.",
  "I'm tired but my brain won't shut up.",
  "Nobody gets it and I don't know how to explain.",
  "I just need to get this out of my head.",
];

const TONE_BG: Record<string, string> = {
  "gen-z": "linear-gradient(180deg, #EAE0D2 0%, #F5EFE6 40%)",
  "balanced": "linear-gradient(180deg, #EDE6DA 0%, #F5EFE6 40%)",
  "grounded": "linear-gradient(180deg, #E8E2D6 0%, #F5EFE6 40%)",
};

export default function HomePage() {
  const {
    appState,
    isListening,
    isProcessing,
    selectedTone,
    setSelectedTone,
    messages,
    startListening,
    stopListening,
    processPrompt,
  } = useAuraCare();

  const conversationRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (conversationRef.current && hasMessages) {
      conversationRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, hasMessages]);

  const handleMicPress = () => {
    if (isListening) stopListening();
    else if (appState === "idle" || appState === "responded") startListening();
  };

  // Tap a preset prompt → skip voice mode, process immediately
  const handlePromptTap = (prompt: string) => {
    processPrompt(prompt);
  };

  return (
    <main
      className="relative min-h-dvh w-full flex flex-col items-center overflow-x-hidden"
      style={{ background: TONE_BG[selectedTone], transition: "background 0.8s ease" }}
    >
      {/* ─── Ambient blobs ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute animate-blob-1" style={{
          width: 560, height: 560,
          borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
          background: "radial-gradient(circle, rgba(184,154,114,0.17) 0%, transparent 65%)",
          top: "-140px", left: "-100px",
        }} />
        <div className="absolute animate-blob-2" style={{
          width: 480, height: 480,
          borderRadius: "40% 60% 30% 70% / 60% 40% 50% 50%",
          background: "radial-gradient(circle, rgba(139,111,71,0.10) 0%, transparent 65%)",
          top: "25%", right: "-120px",
        }} />
        <div className="absolute animate-blob-3" style={{
          width: 380, height: 380,
          borderRadius: "70% 30% 50% 50% / 40% 60% 40% 60%",
          background: "radial-gradient(circle, rgba(210,188,160,0.12) 0%, transparent 65%)",
          bottom: "8%", left: "5%",
        }} />
      </div>

      {/* ─── Header ─── */}
      <header className="relative z-20 w-full flex justify-between items-center px-6 pt-6 pb-4 animate-fade-in">
        <span className="text-sm font-semibold tracking-[0.18em] uppercase"
          style={{ color: "var(--aura-accent)" }}>AuraCare</span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-500"
          style={{
            background: isListening ? "rgba(192,133,106,0.12)" : "rgba(250,247,242,0.85)",
            border: isListening ? "1px solid rgba(192,133,106,0.3)" : "1px solid var(--aura-border)",
            backdropFilter: "blur(8px)",
          }}>
          <span className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
            style={{
              background: isListening ? "var(--aura-rose)" : "var(--aura-accent-light)",
              animation: isListening ? "dot-bounce 1.2s ease-in-out infinite" : "none",
            }} />
          <span className="text-xs font-medium transition-colors duration-300"
            style={{ color: isListening ? "var(--aura-rose)" : "var(--aura-text-muted)" }}>
            {isListening ? "Live" : isProcessing ? "Processing" : "Ready"}
          </span>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative z-10 w-full flex flex-col items-center px-6 pt-2 pb-6">
        <h1 className="text-[2.5rem] leading-[1.18] font-light text-center mb-4 animate-fade-in-up delay-100"
          style={{ fontFamily: "var(--font-dm-serif)", color: "var(--aura-text)" }}>
          Speak freely.{" "}
          <span className="text-shimmer" style={{ fontFamily: "inherit" }}>Be heard.</span>
        </h1>
        <p className="text-sm leading-[1.85] text-center max-w-[260px] mb-5 animate-fade-in-up delay-200"
          style={{ color: "var(--aura-text-muted)" }}>
          A voice companion that listens.{" "}
          <span style={{ fontWeight: 500, color: "var(--aura-text)" }}>No judgment.</span>{" "}
          Anytime.
        </p>
        <div className="flex gap-2 mb-8 animate-fade-in-up delay-300">
          {["Voice only", "No judgment"].map((f) => (
            <span key={f} className="px-3.5 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(250,247,242,0.9)", border: "1px solid var(--aura-border)", color: "var(--aura-text-muted)" }}>
              {f}
            </span>
          ))}
        </div>

        {/* ── Focal card ── */}
        <div className="w-full max-w-sm rounded-3xl flex flex-col items-center gap-0 overflow-hidden animate-fade-in-up delay-400"
          style={{
            background: "var(--aura-surface)",
            border: "1px solid var(--aura-border)",
            boxShadow: "0 16px 56px rgba(47,42,36,0.12), 0 2px 8px rgba(47,42,36,0.06)",
          }}>
          <div className="w-full flex flex-col items-center pt-8 pb-6 px-6 transition-all duration-700"
            style={{
              background: isListening
                ? "linear-gradient(180deg, rgba(192,133,106,0.08) 0%, rgba(250,247,242,0) 100%)"
                : "linear-gradient(180deg, rgba(237,230,218,0.55) 0%, rgba(250,247,242,0) 100%)",
            }}>
            <MicButton appState={appState} tone={selectedTone} onMicPress={handleMicPress} />
            <div className="mt-3 flex flex-col items-center gap-1.5">
              <StatusText appState={appState} />
              {appState === "idle" && (
                <p className="text-xs animate-fade-in"
                  style={{ color: "var(--aura-text-muted)", opacity: 0.4 }}>
                  Tap the circle to start
                </p>
              )}
            </div>
          </div>
          <Divider />
          <div className="w-full px-6 py-5">
            <p className="text-xs uppercase tracking-widest font-semibold mb-4"
              style={{ color: "var(--aura-accent-light)" }}>
              Response Tone
            </p>
            <ToneSlider value={selectedTone} onChange={setSelectedTone} />
          </div>
        </div>
      </section>

      {/* ─── Tappable prompts ─── */}
      {!hasMessages && !isProcessing && (
        <section className="relative z-10 w-full max-w-sm px-6 pb-32 animate-fade-in-up delay-600">
          <div className="flex flex-col gap-2.5">
            {MOOD_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptTap(prompt)}
                disabled={isListening || isProcessing}
                className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 animate-fade-in-up transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "var(--aura-surface)",
                  borderLeft: "2.5px solid var(--aura-accent-light)",
                  borderTop: "1px solid var(--aura-border)",
                  borderRight: "1px solid var(--aura-border)",
                  borderBottom: "1px solid var(--aura-border)",
                  animationDelay: `${0.65 + i * 0.07}s`,
                  opacity: 0,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "var(--aura-surface-2)";
                  el.style.borderLeftColor = "var(--aura-rose)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "var(--aura-surface)";
                  el.style.borderLeftColor = "var(--aura-accent-light)";
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="var(--aura-accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="flex-shrink-0">
                  <rect x="9" y="2" width="6" height="11" rx="3" />
                  <path d="M19 10a7 7 0 01-14 0" />
                </svg>
                <p className="text-sm" style={{ color: "var(--aura-text-muted)", fontStyle: "italic" }}>
                  &ldquo;{prompt}&rdquo;
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── Conversation ─── */}
      {(hasMessages || isProcessing) && (
        <section ref={conversationRef} className="relative z-10 w-full flex flex-col items-center pb-32">
          <ConversationHistory messages={messages} isProcessing={isProcessing} />
        </section>
      )}

      {/* ─── Footer ─── */}
      <footer className="relative z-10 w-full flex flex-col items-center justify-center pb-24 mt-auto px-6 text-center">
        <p className="text-[11px] font-medium max-w-sm leading-relaxed" style={{ color: "var(--aura-text-muted)", opacity: 0.75 }}>
          AuraCare is not a medical professional and does not provide medical advice.
          If you're experiencing a crisis please contact a licensed professional.
        </p>
      </footer>

      {/* ─── Fixed floating mic FAB ─── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pt-3"
        style={{
          background: "linear-gradient(0deg, var(--aura-bg) 60%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        <button
          onClick={handleMicPress}
          disabled={isProcessing}
          aria-label={isListening ? "Stop mic" : "Start speaking"}
          className="rounded-full flex items-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            pointerEvents: "all",
            padding: isListening ? "10px 20px" : "10px 18px",
            background: isListening
              ? "linear-gradient(135deg, #C0856A, #A0654A)"
              : "linear-gradient(135deg, #A07848, #7A5C34)",
            boxShadow: isListening
              ? "0 6px 28px rgba(192,133,106,0.5), 0 0 0 6px rgba(192,133,106,0.1)"
              : "0 6px 24px rgba(139,111,71,0.35)",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isListening ? (
            /* Stop icon */
            <>
              <span className="flex items-center gap-[2px]">
                {[8, 14, 10, 14, 8].map((h, i) => (
                  <span key={i} className="rounded-full bg-white"
                    style={{
                      width: 2.5, height: h,
                      animation: `waveform 0.75s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0.9,
                    }} />
                ))}
              </span>
              <span className="text-xs font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.92)" }}>
                Stop
              </span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24"
                fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M19 10a7 7 0 01-14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
              <span className="text-xs font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.92)" }}>
                {isProcessing ? "Processing…" : appState === "responded" ? "Speak again" : "Hold to speak"}
              </span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}
