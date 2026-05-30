from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
import shutil
import json

from video_processor import extract_frames, extract_audio, get_video_metadata
from embeddings import generate_text_embeddings, chunk_transcript
from database import store_chunks, create_table, get_db
from qa_engine import answer_question, generate_timeline_summary
import whisper

app = FastAPI(title="Multimodal Video QA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
FRAMES_DIR = "frames"
AUDIO_DIR = "audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

db = get_db()
create_table(db)

whisper_model = None


def get_whisper():
    global whisper_model
    if whisper_model is None:
        whisper_model = whisper.load_model("base")
    return whisper_model


@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    video_id = str(uuid.uuid4())[:8]
    video_path = os.path.join(UPLOAD_DIR, f"{video_id}_{file.filename}")
    with open(video_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    metadata = get_video_metadata(video_path)

    frames_dir = os.path.join(FRAMES_DIR, video_id)
    audio_path = os.path.join(AUDIO_DIR, f"{video_id}.wav")

    frame_paths, duration = extract_frames(video_path, frames_dir, fps=1)
    audio_path = extract_audio(video_path, audio_path)

    model = get_whisper()
    result = model.transcribe(audio_path)
    transcript = result["text"]
    segments = result.get("segments", [])

    chunks, chunk_times = chunk_transcript(transcript)
    chunk_embs = generate_text_embeddings(chunks)
    store_chunks(video_id, chunks, chunk_embs, chunk_times, "transcript")

    frame_descriptions = []
    for fp, ts in frame_paths:
        frame_descriptions.append(f"Frame at {ts:.1f}s")
    if frame_descriptions:
        frame_embs = generate_text_embeddings(frame_descriptions)
        store_chunks(video_id, frame_descriptions, frame_embs, [ts for _, ts in frame_paths], "frame_description")

    timeline_summary, timeline = generate_timeline_summary(video_id)

    return JSONResponse({
        "video_id": video_id,
        "filename": file.filename,
        "duration": duration,
        "metadata": metadata,
        "frame_count": len(frame_paths),
        "transcript": transcript,
        "segments": segments if segments else [],
        "timeline": timeline,
        "summary": timeline_summary,
    })


@app.post("/api/qa")
async def qa_endpoint(video_id: str = Form(...), question: str = Form(...)):
    context, results = answer_question(question, video_id)
    return JSONResponse({
        "question": question,
        "context": context,
        "results": results,
    })


@app.post("/api/summarize")
async def summarize_endpoint(video_id: str = Form(...)):
    summary, timeline = generate_timeline_summary(video_id)
    return JSONResponse({
        "video_id": video_id,
        "summary": summary,
        "timeline": timeline,
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
