import {useState} from "react";
import {extractFramesWithFFmpeg} from "./utils/extractFramesWithFFmpeg.ts";

function App() {
    const [finalFrames,setFinalFrames] = useState<string[]>([]);
    const [selectedFrame, setSelectedFrame] = useState<string>("");


    console.log(finalFrames)

   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];

       if (!file) return;


           const extracted = await extractFramesWithFFmpeg({ file,fps : 1});
           setFinalFrames(extracted);
   }

  return (
    <>
     <h1>Video Frames</h1>
     <input type="file" accept="video/*" onChange={handleUpload}   />


        <div className="timeline" style={{ display: "flex", overflowX: "auto", gap: "4px", padding: "8px" }}>

            {finalFrames.map((src, index) => (
                <img
                    onClick={() => setSelectedFrame(src)}
                    key={index}
                    src={src}
                    alt={`Frame ${index}`}
                    style={{
                        width: "80px",
                        height: "100px",
                        objectFit: "cover",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                />
            ))}
        </div>

        <img
        src={selectedFrame}
        height="300px"
        width="400px"

        />
    </>
  )
}

export default App
