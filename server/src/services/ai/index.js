import { runPipeline } from './pipeline.js';

export async function generateReview(input) {
  return runPipeline(input);
}