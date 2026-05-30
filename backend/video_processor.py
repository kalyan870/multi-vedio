import subprocess
import os
import json
import cv2


def extract_audio(video_path, output_path):
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le",
        "-ar", "16000", "-ac", "1",
        output_path, "-y"
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


def extract_frames(video_path, output_dir, fps=1):
    os.makedirs(output_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(video_fps / fps) if video_fps > 0 else 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / video_fps if video_fps > 0 else 0

    frame_paths = []
    count = 0
    success = True
    while success:
        success, frame = cap.read()
        if not success:
            break
        if count % frame_interval == 0:
            timestamp = count / video_fps
            out_path = os.path.join(output_dir, f"frame_{count:06d}.jpg")
            cv2.imwrite(out_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            frame_paths.append((out_path, timestamp))
        count += 1
    cap.release()
    return frame_paths, duration


def get_video_metadata(video_path):
    cap = cv2.VideoCapture(video_path)
    metadata = {
        "fps": cap.get(cv2.CAP_PROP_FPS),
        "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        "duration": cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS) if cap.get(cv2.CAP_PROP_FPS) > 0 else 0,
    }
    cap.release()
    return metadata
