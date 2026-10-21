import dotenv from 'dotenv';
import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import { generateReview } from '../src/services/ai/index.js';

dotenv.config({ quiet: true });

const { values: v } = parseArgs({
  options: {
    file: { type: 'string' },
    rating: { type: 'string' },
    feedback: { type: 'string', default: '' },
    topics: { type: 'string', default: '' },
    provider: { type: 'string', default: 'mock' },
    language: { type: 'string', default: 'en' },
    style: { type: 'string', default: 'casual' },
    model: { type: 'string' },
    attempt: { type: 'string', default: '1' },
    nokey: { type: 'boolean', default: false },
  },
});

let input;
if (v.file) {
  input = JSON.parse(await readFile(v.file, 'utf8'));
} else {
  input = {
    business: {
      name: 'Spice Garden',
      language: v.language,
      writingStyle: v.style,
      aiProvider: v.provider,
      aiModel: v.model || process.env.AI_DEFAULT_MODEL || '',
      apiKey: v.nokey ? '' : v.provider === 'mock' ? 'mock-key' : process.env.GEMINI_API_KEY || '',
    },
    rating: Number(v.rating),
    topics: v.topics ? v.topics.split(',').map((t) => t.trim()) : [],
    feedback: v.feedback,
    attempt: Number(v.attempt),
  };
}

try {
  console.log(JSON.stringify(await generateReview(input), null, 2));
} catch (err) {
  console.error('Input error:', err.message);
  process.exitCode = 1;
}