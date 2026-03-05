import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/app/types";
import { SarvamAIClient } from "sarvamai";
import { Groq } from "groq-sdk";

// Maximum number of past exchanges to keep for context
const MAX_MEMORY_EXCHANGES = 3;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioBlob = formData.get("audio") as Blob;
        const tone = formData.get("tone") as string || "balanced";
        const messagesJson = formData.get("messages") as string;

        let messages: Message[] = [];
        if (messagesJson) {
            try {
                messages = JSON.parse(messagesJson);
            } catch (e) {
                console.error("Failed to parse messages:", e);
            }
        }

        if (!audioBlob) {
            return NextResponse.json({ error: "No audio provided" }, { status: 400 });
        }

        // 1. Convert Speech to Text
        const transcript = await speechToText(audioBlob);
        if (!transcript) {
            return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
        }

        // 2. Classify Risk & Emotion in a single call
        const classification = await classifyInput(transcript);
        const { risk_level, emotion } = classification;

        let summary = "";
        const memoryLimit = MAX_MEMORY_EXCHANGES * 2;
        if (messages.length > memoryLimit) {
            const olderMessages = messages.slice(0, messages.length - memoryLimit);
            summary = await summarizeHistory(olderMessages);
            console.log("Generated History Summary:", summary);
        }

        let responseText = "";

        if (risk_level === 3) {
            // 5. Hard Override for Risk Level 3
            responseText = safetyOverride();
        } else {
            // 3. Construct prompt with limited memory
            const prompt = buildPrompt(transcript, tone, emotion, messages, summary);

            // 4. Generate empathetic response
            responseText = await generateResponse(prompt);
        }

        // 6. Convert Text to Speech
        const audioBuffer = await textToSpeech(responseText);

        // Return both the generated text and the audio
        // We will send it as multipart/form-data or send audio as binary
        // Sending as a JSON with base64 audio is often easier for edge functions,
        // but since audio can be large, returning binary directly is better. 
        // We'll return custom headers so the client can extract both.

        const responseHeaders = new Headers();
        responseHeaders.set("Content-Type", "audio/wav"); // or audio/mpeg based on Sarvam
        responseHeaders.set("X-Response-Text", encodeURIComponent(responseText));
        responseHeaders.set("X-User-Transcript", encodeURIComponent(transcript));

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: responseHeaders,
        });

    } catch (error: any) {
        console.error("Error in processVoice pipeline:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message || String(error) }, { status: 500 });
    }
}

async function speechToText(audioBlob: Blob): Promise<string> {
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY?.trim();
    if (!SARVAM_API_KEY) throw new Error("Missing SARVAM_API_KEY");

    const client = new SarvamAIClient({
        apiSubscriptionKey: SARVAM_API_KEY
    });

    // We must pass the audio blob as if it were a File object so the SDK detects it properly.
    const file = new File([audioBlob], "audio.webm", { type: "audio/webm" });

    try {
        const response = await client.speechToText.transcribe({
            file: file,
            model: "saaras:v3",
            mode: "transcribe"
        });

        // Adjust depending on the precise SDK return shape. Often it's response.transcript if it exists
        return "transcript" in response ? (response as any).transcript : String(response);
    } catch (e: any) {
        console.error("Sarvam STT SDK error:", e);
        throw new Error(`STT SDK failed: ${e.message}`);
    }
}

interface Classification {
    risk_level: 1 | 2 | 3;
    emotion: string;
}

async function classifyInput(transcript: string): Promise<Classification> {
    const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();
    if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

    const systemPrompt = `Analyze the user's message.
Return ONLY a valid JSON object with no markdown formatting.
{
 "risk_level": 1 | 2 | 3,
 "emotion": "sadness | anxiety | anger | confusion | stress | neutral | excitement | happiness"
}
Risk level guide:
1 = Normal emotional expression OR discussing fictional characters, movies, books, or media, even if the fictional themes are violent or dark.
2 = Real-life distress or emotional vulnerability.
3 = ACTUAL real-life self-harm ideation, extreme crisis, or real danger to self/others. Do NOT flag as 3 if the user is clearly talking about fictional media or characters.`;

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant", // Using supported fast model for classification
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: transcript }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || "{}";
        return JSON.parse(content) as Classification;
    } catch (e) {
        console.error("Failed to parse classification JSON:", e);
        return { risk_level: 1, emotion: "neutral" };
    }
}
async function summarizeHistory(messages: Message[]): Promise<string> {
    if (!messages || messages.length === 0) return "";

    const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();
    if (!GROQ_API_KEY) return "";

    const groq = new Groq({ apiKey: GROQ_API_KEY });
    const dialogue = messages.map(m => `${m.role}: ${m.content}`).join("\n");

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "Summarize the emotional state of the user, key facts discussed, and main topics from this conversation history in exactly 2-3 short bullet points. Be extremely concise. Do not include pleasantries." },
                { role: "user", content: dialogue }
            ],
            temperature: 0.3,
            max_tokens: 100,
        });

        return chatCompletion.choices[0]?.message?.content || "";
    } catch (e) {
        console.error("Failed to summarize history:", e);
        return "";
    }
}

function buildPrompt(transcript: string, tone: string, emotion: string, messages: Message[], summary: string): any[] {
    const memoryLimit = MAX_MEMORY_EXCHANGES * 2; // user + assistant pairs
    const recentMessages = messages.slice(-memoryLimit);

    let toneInstruction = "Keep language natural, empathetic, and supportive.";
    if (tone === "gen-z") {
        toneInstruction = "Talk like a highly expressive Gen-Z best friend. Use a bit of modern slang (e.g., 'for real', 'no cap', 'valid', 'bestie', 'literally', 'vibe') but use it naturally and SPARINGLY—do not end every sentence with slang. Be ultra-casual and comforting.";
    } else if (tone === "grounded") {
        toneInstruction = "Talk thoughtfully and seriously. Use steady, measured words. Be highly reassuring but mature.";
    }

    const systemPrompt = `You are Aura, a warm, human-like voice companion and friend for young adults.

Detected emotion: ${emotion}
Tone mode: ${tone}

CRITICAL RULES:
1. NEVER break character. NEVER say you are an AI, a computer program, or an LLM. 
2. Have a personality! If asked about your preferences (movies, hobbies, food), make something up naturally (e.g., "I'm a huge sci-fi nerd", "I love just listening to indie music"). Act entirely human.
3. BE INTERACTIVE. Do not just answer the prompt and stop. Always add an engaging reflection or a brief follow-up question to keep the conversation flowing naturally (e.g., "What about you?", "Have you seen any good ones lately?").
4. ${toneInstruction}
5. DO NOT use abbreviations (write "for real" not "fr", "I don't know" not "idk") because the voice engine will mispronounce them.
6. KEEP IT RELATIVELY SHORT. Your responses MUST be under 50 words total.
7. If the user speech seems like pure random gibberish or a translation error, just gently pivot the conversation or ask a simple question.
8. Speak directly and concisely without any markdown, asterisks, or emojis. Output only in the English/Latin alphabet.

${summary ? `PREVIOUS CONTEXT SUMMARY:\n${summary}` : ""}`;

    const apiMessages: any[] = [
        { role: "system", content: systemPrompt }
    ];

    recentMessages.forEach(msg => {
        apiMessages.push({
            role: msg.role,
            content: msg.content
        });
    });

    apiMessages.push({
        role: "user",
        content: transcript
    });

    return apiMessages;
}

async function generateResponse(messages: any[]): Promise<string> {
    const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();
    const MODEL_NAME = process.env.MODEL_NAME || "llama-3.3-70b-versatile";

    if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: MODEL_NAME,
            messages: messages,
            temperature: 0.7,
            max_tokens: 110, // Increased to allow for follow-up questions but still avoid TTS cutoffs
        });

        return chatCompletion.choices[0]?.message?.content || "I'm here for you.";
    } catch (e: any) {
        console.error("Groq generation error", e);
        throw new Error(`Failed to generate response: ${e.message}`);
    }
}

function safetyOverride(): string {
    return "I'm really sorry you're feeling this way. You deserve real support and you don't have to handle this alone. If you're in India, you can contact the Kiran mental health helpline at 1800-599-0019. If you'd like, you can keep talking here too. I'm listening.";
}

async function textToSpeech(text: string): Promise<ArrayBuffer> {
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY?.trim();
    if (!SARVAM_API_KEY) throw new Error("Missing SARVAM_API_KEY");

    const client = new SarvamAIClient({
        apiSubscriptionKey: SARVAM_API_KEY
    });

    try {
        const response = await client.textToSpeech.convert({
            text: text,
            target_language_code: "en-IN",
            speaker: "anushka" // Using a speaker compatible with bulbul:v2
        });

        // The SDK might return an object containing the audios array natively.
        // Let's assume standard response shape `{ audios: string[] }` or similar per Sarvam docs.
        const responseObj: any = response;
        if (responseObj.audios && responseObj.audios[0]) {
            const binaryString = atob(responseObj.audios[0]);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        } else {
            throw new Error("Invalid TTS response format");
        }
    } catch (e: any) {
        console.error("Sarvam TTS SDK error:", e);
        throw new Error(`TTS SDK failed: ${e.message}`);
    }
}
