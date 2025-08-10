

import {useState} from "react";
import {useFFmpeg} from "./hooks/ffmpeg.ts";

export default function App() {
    const [frames,setFrames ] = useState<string[] | null>(null);
    const[currentFrame, setCurrentFrame] = useState<string | null>(null);



    const { loaded,extractFrames } = useFFmpeg();

    const handleFileChange = async (file : File) => {
        if (!loaded || !file) return;

        const result = await extractFrames({file,fps : 1})

        setFrames(result)
    }


    return (
        <div>
            <div className="w-[200px] h-[400px] bg-black flex items-center justify-center overflow-hidden">
                {frames && frames.length > 0 ? (
                    <img
                        src={currentFrame as string}
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

                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "1px",
                        marginTop: "10px",
                        overflowX: "auto",  // Changed from overflowY to overflowX for horizontal scrolling
                        height: "100px",
                        position: "relative",  // Added to position the Pin absolutely within this container
                    }}>
                        {frames?.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`Frame ${i}`}
                                style={{ width: "100px", height: "100px" }}
                                onClick={() => setCurrentFrame(src)}
                            />
                        ))}
                        <Pin />
                    </div>

                </>
            ) : (
                <div>Loading FFmpeg...</div>
            )}
        </div>
    );
}


const Pin = () => {
    return (
        <div
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
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