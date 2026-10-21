import dotenv from 'dotenv';
import { createGeminiProvider } from '../src/services/ai/providers/gemini.js';

dotenv.config({ quiet: true });

const model = process.env.AI_DEFAULT_MODEL;
console.log('model:', model || '(empty)');

try {
  const out = await createGeminiProvider().generate({
    system: 'Reply with one short sentence.',
    user: 'Say hello.',
    model,
    apiKey: process.env.GEMINI_API_KEY,
    timeoutMs: 8000,
  });
  console.log('OK:', out.text);
} catch (e) {
  console.log('ERROR code:', e.code, '| message:', e.message);

  // List the models this key can use (prints names only, never the key)
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
  });
  console.log('model list status:', res.status);
  if (res.ok) {
    const data = await res.json();
    const names = (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace('models/', ''))
      .filter((n) => n.includes('flash'));
    console.log('flash models you can use:\n' + names.join('\n'));
  }
}