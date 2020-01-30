import React, { useEffect, useState, useRef } from "react";
import Editor from "./components/Editor";
import {
    getProgram,
    sendInitMessage,
    closeWs,
    sendPatches,
    wsClient
} from "./apiClient";
import DiffMatchPatch from "diff-match-patch";
import debounce from "lodash.debounce";

const PROGRAM_ID = "YoSgfSIZ";

const dmp = new DiffMatchPatch();

function App() {
    const [content, setContent] = useState("");
    const monacoRef = useRef(null);

    const handleChange = debounce(() => {
        console.log(content);
        const value = monacoRef.current.editor.getModels()[0].getValue();
        const patches = dmp.patch_make(content, value);
        const patchString = dmp.patch_toText(patches);
        sendPatches(PROGRAM_ID, patchString);
        setContent(value);
    }, 700);

    useEffect(() => {
        getProgram(PROGRAM_ID).then(resp => {
            if (resp && resp.data) {
                setContent(resp.data.data.content);
                sendInitMessage(PROGRAM_ID);
            }
        });

        wsClient.onmessage = ev => {
            setContent(ev.data);
        };
        return () => {
            closeWs();
        };
    }, []);

    return (
        <Editor
            content={content}
            onChange={handleChange}
            monacoRef={monacoRef}
        />
    );
}

export default App;
