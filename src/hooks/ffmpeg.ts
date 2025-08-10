
import {FFmpeg} from "@ffmpeg/ffmpeg";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import {useEffect,useState,useRef} from "react";


export const useFFmpeg = () =>{
    const[loaded, setLoaded] = useState(false);

    const ffmpegRef = useRef<FFmpeg | null>(null);

    useEffect(() => {
        const loadFFmpeg= async () => {
            if(!ffmpegRef.current){
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

        }

        loadFFmpeg();
    },[])

    const extractFrames = async ({ file,fps } : { file : File,fps : number}) => {
        if (!file || !ffmpegRef.current) return [];

        const ffmpeg = ffmpegRef.current;

        await ffmpeg.writeFile("input.mp4",await fetchFile(file))
        await ffmpeg.exec([
            "-i", "input.mp4",
            "-vf", `fps=${fps}`,
            "frame_%03d.png"
        ]);

        const frames: string[] = [];

        let index = 1;

        while (true){
            const fileName = `frame_${String(index).padStart(3,"0")}.png`;
            try {
                const data = await ffmpeg.readFile(fileName);
                const blob = new Blob([data], { type : "image/png" });
                frames.push(URL.createObjectURL(blob));
                index++;
            }catch{
                break;
            }

        }
        return frames;



    }


    return {
        loaded,
        extractFrames,

    }
}