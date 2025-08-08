import {FFmpeg} from "@ffmpeg/ffmpeg";
import {fetchFile} from "@ffmpeg/util";


const ffmpeg = new FFmpeg();

export async function extractFramesWithFFmpeg({ file,fps} : { file : File,fps : number}): Promise<string[]> {
    if(!ffmpeg.loaded){
        await ffmpeg.load();
    }

    const fileName = "input.mp4"
    ffmpeg.writeFile(fileName,await fetchFile(file))

    await ffmpeg.exec([
        "-i",fileName,
        "-vf",`fps=${fps}`,
        "frame_%03d.jpg",

    ])
    return  []
}