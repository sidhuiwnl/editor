import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function FrameExtractor() {
    const [loaded, setLoaded] = useState(false);
    const [frames, setFrames] = useState<string[] | []>([]);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    useEffect(() => {
        const loadFFmpeg = async () => {
            if (!ffmpegRef.current) {
                ffmpegRef.current = new FFmpeg();
            }
            const ffmpeg = ffmpegRef.current;

            if (ffmpeg.loaded) {
                setLoaded(true);
                return;
            }

            const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            });

            setLoaded(true);
        };

        loadFFmpeg();
    }, []);

    const handleFileChange = async (file  : File) => {
        if (!file) return;
        const ffmpeg = ffmpegRef.current as FFmpeg;

        await ffmpeg.writeFile("input.mp4", await fetchFile(file));
        await ffmpeg.exec([
            "-i", "input.mp4",
            "-vf", "fps=1",
            "frame_%03d.png"
        ]);

        const newFrames = [];
        let index = 1;
        while (true) {
            const frameName = `frame_${String(index).padStart(3, "0")}.png`;


            try {
                const data = await ffmpeg.readFile(frameName);
                const blob = new Blob([data], { type: "image/png" });
                newFrames.push(URL.createObjectURL(blob));
                index++;
            } catch {
                break;
            }
        }
        setFrames(newFrames);
    };

    return (
        <div>
            {loaded ? (
                <>
                    <input type="file" accept="video/*" onChange={(e) => {
                        const file = e.target.files?.[0] as File;
                        handleFileChange(file);
                    }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {frames.map((src, i) => (
                            <img key={i} src={src} alt={`Frame ${i}`} style={{ width: "150px" }} />
                        ))}
                    </div>
                </>
            ) : (
                <div>Loading FFmpeg...</div>
            )}
        </div>
    );
}
