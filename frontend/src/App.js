import React, { useEffect, useState } from "react";
import Editor from "./components/Editor";
import {
    getProgram,
    sendInitMessage,
    closeWs,
    sendPatches,
    wsClient
} from "./apiClient";
import DiffMatchPatch from "diff-match-patch";

const PROGRAM_ID = "YoSgfSIZ";

const dmp = new DiffMatchPatch();

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
            closeWs();
        };
    }, []);

    useEffect(() => {
        wsClient.onmessage = ev => {
            console.log(ev.data);
            const patches = dmp.patch_fromText(ev.data);
            console.log("Content" + content);
            const results = dmp.patch_apply(patches, content);
            setContent(results[0]);
        };
    }, [content]);

    const handleChange = value => {
        console.log("HANDLE CHANGE");
        const patches = dmp.patch_make(content, value);
        const patchString = dmp.patch_toText(patches);
        sendPatches(PROGRAM_ID, patchString);
        setContent(value);
    };

    return <Editor content={content} onChange={handleChange} />;
}

export default App;
