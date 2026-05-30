from embeddings import generate_text_embeddings
from database import search, get_all_chunks
import numpy as np


def answer_question(question, video_id):
    query_emb = generate_text_embeddings([question])[0]
    results = search(query_emb, top_k=5, video_id=video_id)
    context_parts = []
    for r in results:
        context_parts.append(f"[{r['timestamp']:.1f}s] ({r['type']}): {r['content']}")
    context = "\n".join(context_parts)
    return context, results


def generate_timeline_summary(video_id):
    chunks = get_all_chunks(video_id)
    transcript_parts = [c for c in chunks if c["type"] == "transcript"]
    frame_parts = [c for c in chunks if c["type"] == "frame_description"]

    timeline = []
    for c in transcript_parts:
        timeline.append({"time": c["timestamp"], "content": c["content"], "type": "transcript"})
    for c in frame_parts:
        timeline.append({"time": c["timestamp"], "content": c["content"], "type": "visual"})
    timeline.sort(key=lambda x: x["time"])

    summary_prompt = "Timeline of video events:\n"
    for entry in timeline:
        summary_prompt += f"\n[{entry['time']:.1f}s] ({entry['type']}): {entry['content']}"

    return summary_prompt, timeline
