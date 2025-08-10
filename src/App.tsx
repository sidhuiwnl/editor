

import {useRef, useState} from "react";
import {useFFmpeg} from "./hooks/ffmpeg.ts";

export default function App() {
    const [frames,setFrames ] = useState<string[] | null>(null);
    const[currentFrame, setCurrentFrame] = useState<number>(0);
    const trackRef = useRef<HTMLDivElement | null>(null)



    const { loaded,extractFrames } = useFFmpeg();

    const handleFileChange = async (file : File) => {
        if (!loaded || !file) return;

        const result = await extractFrames({file,fps : 1})

        setFrames(result)
        setCurrentFrame(0)
    }

    const handleDrag = (clientX : number) => {
        if (!trackRef.current || !frames) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const frameIndex = Math.floor((x / rect.width) * frames.length);
        setCurrentFrame(frameIndex);

    }


    return (
        <div>
            <div className="w-[200px] h-[400px] bg-black flex items-center justify-center overflow-hidden">
                {frames && frames.length > 0 ? (
                    <img
                        src={frames[currentFrame]}
                        alt="Current frame"
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <span className="text-white">No frame</span>
                )}
            </div>

            {loaded ? (
                <>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e.target.files?.[0] as File)}

                    />

                    <div
                    ref={trackRef}
                        style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "1px",
                        marginTop: "10px",
                        overflowX: "auto",
                        height: "100px",
                        position: "relative",

                    }}
                         onMouseDown={(e) => {
                             e.preventDefault();
                             handleDrag(e.clientX)

                             const move = (ev : MouseEvent) => handleDrag(ev.clientX)

                             const up = () => {
                                 window.removeEventListener("mousemove", move);
                                 window.removeEventListener("mouseup", up);
                             };
                             window.addEventListener("mousemove", move);
                             window.addEventListener("mouseup", up);
                         }}
                         onTouchStart={(e) => {
                             handleDrag(e.touches[0].clientX);
                             const move = (ev: TouchEvent) =>
                                 handleDrag(ev.touches[0].clientX);

                             const up = () => {
                                 window.removeEventListener("touchmove", move);
                                 window.removeEventListener("touchend", up);
                             };
                             window.addEventListener("touchmove", move);
                             window.addEventListener("touchend", up);
                         }}
                    >
                        {frames?.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Frame ${i}`}
                                style={{ width: "100px", height: "100px" }}

                            />
                        ))}
                        <Pin currentFrameIndex={currentFrame} frames={frames} />
                    </div>

                </>
            ) : (
                <div>Loading FFmpeg...</div>
            )}
        </div>
    );
}


const Pin = ({ currentFrameIndex,frames } : { currentFrameIndex : number, frames : string[] | null}) => {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: `${((currentFrameIndex / ((frames?.length || 1) - 1)) * 100)}%`,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pointerEvents: "none", // So it doesn't interfere with clicking frames
                height: "100%", // Match container height
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    border: "1px solid gray",
                }}
            ></div>
            <div
                style={{
                    width: "2px",
                    height: "50px", // Fixed height instead of flex
                    backgroundColor: "white",
                }}
            ></div>
        </div>
    )
}