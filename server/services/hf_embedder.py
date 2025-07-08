import sys
import json
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def main():
    if len(sys.argv) < 2:
        print('Usage: hf_embedder.py <input_file>', file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1], 'r') as f:
        texts = f.read().split('\n---SPLIT---\n')
    embeddings = model.encode(texts, convert_to_numpy=True).tolist()
    print(json.dumps(embeddings))

if __name__ == '__main__':
    main()
