import lancedb
import numpy as np

DB_PATH = "./vector_db"
TABLE_NAME = "video_chunks"

def get_db():
    return lancedb.connect(DB_PATH)

def create_table(db):
    if TABLE_NAME not in db.table_names():
        db.create_table(
            TABLE_NAME,
            data=[
                {
                    "id": "init",
                    "vector": np.zeros(384).tolist(),
                    "timestamp": 0.0,
                    "content": "",
                    "type": "init",
                    "video_id": "init",
                }
            ],
        )
        tbl = db.open_table(TABLE_NAME)
        tbl.delete("id = 'init'")

def store_chunks(video_id, chunks, embeddings, timestamps, chunk_type="transcript"):
    db = get_db()
    if TABLE_NAME not in db.table_names():
        create_table(db)
    tbl = db.open_table(TABLE_NAME)
    data = []
    for i, (chunk, emb, ts) in enumerate(zip(chunks, embeddings, timestamps)):
        data.append({
            "id": f"{video_id}_{chunk_type}_{i}",
            "vector": emb.tolist() if isinstance(emb, np.ndarray) else emb,
            "timestamp": ts,
            "content": chunk,
            "type": chunk_type,
            "video_id": video_id,
        })
    tbl.add(data)

def search(query_embedding, top_k=5, video_id=None):
    db = get_db()
    tbl = db.open_table(TABLE_NAME)
    if video_id:
        results = tbl.search(query_embedding).where(f"video_id = '{video_id}'").limit(top_k).to_list()
    else:
        results = tbl.search(query_embedding).limit(top_k).to_list()
    return results

def get_all_chunks(video_id):
    db = get_db()
    tbl = db.open_table(TABLE_NAME)
    return tbl.search().where(f"video_id = '{video_id}'").limit(1000).to_list()
