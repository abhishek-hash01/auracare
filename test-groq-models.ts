import { Groq } from 'groq-sdk';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const envContent = readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/['"]/g, '').trim();
});

const groq = new Groq({ apiKey: env.GROQ_API_KEY });
async function check() {
    try {
        const m = await groq.models.list();
        console.log(m.data.map((d: any) => d.id).join(', '));
    } catch (e) { console.error(e); }
}
check();
