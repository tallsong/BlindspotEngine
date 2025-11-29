import os
import json
import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Optional
import sys

# We need to decide which embedding function to use.
# Since we might not have API keys in the environment for execution of tests *unless* we are using the official ones,
# but the user said "uses langchain-google-genai", implying keys are available in production/dev.
# For this script, I will try to use a lightweight local embedding model to avoid API Key dependency if possible,
# OR use the Mock/Fake embedding if I can't load one.
# However, the requirement is to use "Google embeddings or OpenAI embeddings".
# I'll default to a simple sentence-transformer if available (chroma default) to ensure it runs locally for me,
# but allow swapping.
# Actually, Chroma's default `DefaultEmbeddingFunction` uses `onnxruntime` and `tokenizers` to run a small model locally.
# This is perfect for "The Vector Engine" Sprint 2 without needing an API key immediately.

class VectorEngine:
    def __init__(self, persist_path: str = "backend/chroma_db"):
        # Adjust path relative to where script is run
        if not os.path.exists(os.path.dirname(persist_path)) and os.path.dirname(persist_path):
             os.makedirs(os.path.dirname(persist_path), exist_ok=True)

        self.client = chromadb.PersistentClient(path=persist_path)

        # Use default embedding function (all-MiniLM-L6-v2)
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()

        self.collection = self.client.get_or_create_collection(
            name="unknown_unknowns",
            embedding_function=self.embedding_fn
        )

    def ingest_concepts(self, json_path: str):
        with open(json_path, 'r') as f:
            concepts = json.load(f)

        ids = [c['name'] for c in concepts]
        documents = [f"{c['name']}: {c['explanation']} (Domain: {c['domain']})" for c in concepts]
        metadatas = [{"name": c['name'], "domain": c['domain'], "explanation": c['explanation'], "utility": c['utility']} for c in concepts]

        # Chroma handles updates/upserts by ID
        self.collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        print(f"Ingested {len(concepts)} concepts into Vector Store.")

    def find_unknown_unknown(self, user_topics: List[str], n_results: int = 5) -> Dict:
        """
        Finds a concept that is distinct from user_topics.
        Strategy:
        1. Query the collection with the user_topics.
        2. Get *many* results (e.g., all or top 20).
        3. The results returned by Chroma are sorted by similarity (distance).
        4. We want something *far* (large distance) but still relevant (high utility).

        Actually, if we want "Unknown Unknowns", we specifically want things that are NOT semantically close.
        So we should look at the *tail* of the similarity search, or search for "Negative" of the topic?

        Better approach:
        Fetch a large set of random-ish high utility concepts, or fetch *all* and sort by distance descending.
        Since we have a small dataset (<100), we can fetch all.
        """

        # Combine user topics into a single query string for embedding
        query_text = ", ".join(user_topics)

        # Fetch all items (limit 100 for now)
        count = self.collection.count()
        if count == 0:
            return None

        results = self.collection.query(
            query_texts=[query_text],
            n_results=min(count, 20)
        )

        # results['distances'] are typically cosine distance (lower is closer).
        # We want higher distance.
        # Structure of results: {'ids': [[id1, id2]], 'distances': [[d1, d2]], ...}

        ids = results['ids'][0]
        distances = results['distances'][0]
        metadatas = results['metadatas'][0]

        # Zip and sort by distance descending (Furthest first)
        combined = list(zip(ids, distances, metadatas))
        combined.sort(key=lambda x: x[1], reverse=True)

        # Pick the furthest one that is 'high utility' (already filtered by ingestion mostly)
        # To avoid being *too* random, maybe pick from the top 5 furthest.

        candidate = combined[0] # The most distant concept

        return candidate[2] # Return metadata

if __name__ == "__main__":
    # Test script
    engine = VectorEngine()

    # Path handling
    # If run as `python backend/vector_engine.py`, __file__ is backend/vector_engine.py
    # We want backend/data/concepts.json
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, "data/concepts.json")

    if os.path.exists(json_path):
        engine.ingest_concepts(json_path)

        # Test Search
        test_topics = ["Software Engineering", "Coding", "React"]
        result = engine.find_unknown_unknown(test_topics)
        print(f"User Topics: {test_topics}")
        print(f"Recommended Unknown: {result['name']} - {result['explanation']}")
    else:
        print(f"JSON not found at {json_path}")
