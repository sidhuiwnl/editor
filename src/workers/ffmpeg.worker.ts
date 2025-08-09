import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

// Load FFmpeg core
async function loadFFmpeg() {
    if (!ffmpeg.loaded) {
        await ffmpeg.load({
            coreURL: "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm/ffmpeg-core.js",
            wasmURL: "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm/ffmpeg-core.wasm",
            workerURL: "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm/ffmpeg-core.worker.js"
        });
    }
}

self.onmessage = async (event) => {
    const { type, file, fps } = event.data;

    if (type === "extractFrames") {
        await loadFFmpeg();

        const fileName = "input.mp4";
        await ffmpeg.writeFile(fileName, await fetchFile(file));

        // Extract frames as images
        await ffmpeg.exec([
            "-i", fileName,
            "-vf", `fps=${fps}`,
            "frame_%03d.png"
        ]);

        const frames: string[] = [];
        let index = 1;
        while (true) {
            const frameName = `frame_${String(index).padStart(3, "0")}.png`;
            try {
                const data = await ffmpeg.readFile(frameName);
                const blob = new Blob([data], { type: "image/png" });
                frames.push(URL.createObjectURL(blob));
                index++;
            } catch {
                break; // Stop when no more frames
            }
        }

        // Send result back to main thread
        self.postMessage({ type: "framesReady", frames });
    }
};
