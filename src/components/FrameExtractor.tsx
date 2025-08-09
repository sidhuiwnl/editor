
import React, { useState } from "react";
import FFmpegWorker from "../workers/ffmpeg.worker?worker";

export default function FrameExtractor() {
    const [frames, setFrames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        setLoading(true);

        const worker = new FFmpegWorker();
        worker.onmessage = (event) => {
            if (event.data.type === "framesReady") {
                setFrames(event.data.frames);
                setLoading(false);
                worker.terminate();
            }
        };

        worker.postMessage({ type: "extractFrames", file, fps: 1 }); // 1 frame/sec
    };

    return (
        <div>
            <input type="file" accept="video/*" onChange={handleFileChange} />
            {loading && <p>Extracting frames...</p>}
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {frames.map((src, i) => (
                    <img key={i} src={src} style={{ width: 120, margin: 4 }} />
                ))}
            </div>
        </div>
    );
}
