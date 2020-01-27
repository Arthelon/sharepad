import React, { useEffect, useState } from "react";
import Editor from "./components/Editor";
import { getProgram, sendInitMessage, wsClient } from "./apiClient";
const PROGRAM_ID = "YoSgfSIZ";

function App() {
    const [content, setContent] = useState("");
    useEffect(() => {
        getProgram(PROGRAM_ID).then(resp => {
            if (resp && resp.data) {
                setContent(resp.data.data.content);
                sendInitMessage(PROGRAM_ID);
            }
        });
        return () => {
            wsClient.close();
        };
    }, []);

    const handleChange = value => {
        setContent(value);
    };

    return <Editor content={content} onChange={handleChange} />;
}

export default App;
