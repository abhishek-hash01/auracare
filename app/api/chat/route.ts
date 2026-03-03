import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, tone } = body as { message: string; tone: string };

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // TODO: Integrate with AI model (e.g., Gemini, OpenAI)
        // The `tone` parameter will shape the system prompt persona:
        // - "gen-z"      → casual, empathetic, peer-like language
        // - "balanced"   → warm and supportive, neutral vocabulary
        // - "grounded"   → measured, thoughtful, composed responses

        console.log(`[AuraCare API] Received message (tone: ${tone}):`, message);

        // Placeholder response
        const placeholderResponse = {
            reply:
                "I hear you. It sounds like you're carrying a lot right now. Take a breath — you don't have to figure everything out at once. I'm here.",
            tone,
        };

        return NextResponse.json(placeholderResponse, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
