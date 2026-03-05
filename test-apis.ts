import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { SarvamAIClient } from 'sarvamai';
import { Groq } from 'groq-sdk';

// Load .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/['"]/g, '').trim();
});

const { SARVAM_API_KEY, GROQ_API_KEY } = env;

async function testTTS() {
    console.log("Testing Sarvam TTS with SDK...");
    const client = new SarvamAIClient({
        apiSubscriptionKey: SARVAM_API_KEY
    });

    try {
        const response = await client.textToSpeech.convert({
            text: "Hello, this is a test.",
            target_language_code: "hi-IN",
            speaker: "meera"
        });

        console.log("TTS Success, response keys:", Object.keys(response || {}));
    } catch (e: any) {
        console.error("SDK TTS Error:", e);
    }
}

async function testGroq() {
    console.log("Testing Groq with SDK...");
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: "Say hello" }]
        });
        console.log("Groq Success, Response:", chatCompletion.choices[0]?.message?.content);
    } catch (e: any) {
        console.error("SDK Groq Error:", e);
    }
}

async function main() {
    await testTTS();
    await testGroq();
}

main().catch(console.error);
