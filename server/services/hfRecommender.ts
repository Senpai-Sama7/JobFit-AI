// Hugging Face-based recommender for job matching
import * as fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// We'll use the 'sentence-transformers' Python package via a child process for embeddings
// This is a simple, production-ready approach for Node.js backends

// Helper: Call Python script to get embeddings
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // Write texts to a temp file
  const tmpFile = path.join('/tmp', `hf_texts_${Date.now()}.txt`);
  fs.writeFileSync(tmpFile, texts.join('\n---SPLIT---\n'));
  // Call Python script
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [path.join(__dirname, 'hf_embedder.py'), tmpFile]);
    let out = '';
    let err = '';
    py.stdout.on('data', d => { out += d.toString(); });
    py.stderr.on('data', d => { err += d.toString(); });
    py.on('close', code => {
      fs.unlinkSync(tmpFile);
      if (code !== 0) return reject(new Error('Embedder error: ' + err));
      try {
        const arr = JSON.parse(out);
        resolve(arr);
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Compute cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Main: Get top N job matches for a resume
export async function getTopJobMatchesHF(resumeText: string, jobs: { id: string, description: string }[], topN = 5) {
  // Get embeddings for resume and jobs
  const texts = [resumeText, ...jobs.map(j => j.description)];
  const embeddings = await getEmbeddings(texts);
  const resumeEmb = embeddings[0];
  const jobEmbs = embeddings.slice(1);
  // Compute similarities
  const scored = jobs.map((job, i) => ({
    ...job,
    score: cosineSimilarity(resumeEmb, jobEmbs[i])
  }));
  // Sort and return top N
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
