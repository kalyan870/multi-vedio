from sentence_transformers import SentenceTransformer
import numpy as np

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def generate_text_embeddings(texts):
    model = get_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return embeddings


def chunk_transcript(transcript, chunk_size=5):
    words = transcript.split()
    chunks = []
    timestamps = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        timestamps.append((i / len(words)) * 100)
    return chunks, timestamps
