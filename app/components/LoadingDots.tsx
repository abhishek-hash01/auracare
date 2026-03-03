"use client";

export default function LoadingDots() {
    return (
        <div className="flex items-center gap-2 py-2">
            <span
                className="inline-block rounded-full dot-1"
                style={{
                    width: 7,
                    height: 7,
                    background: "var(--aura-accent)",
                    opacity: 0.4,
                }}
            />
            <span
                className="inline-block rounded-full dot-2"
                style={{
                    width: 7,
                    height: 7,
                    background: "var(--aura-accent)",
                    opacity: 0.4,
                }}
            />
            <span
                className="inline-block rounded-full dot-3"
                style={{
                    width: 7,
                    height: 7,
                    background: "var(--aura-accent)",
                    opacity: 0.4,
                }}
            />
        </div>
    );
}
