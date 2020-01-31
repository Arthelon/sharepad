import React, { useEffect, useState, useRef } from "react";
import Editor from "./components/Editor";
import {
    getProgram,
    sendInitMessage,
    closeWs,
    sendProgramChanges,
    wsClient,
    WS_MESSAGE_TYPES
} from "./apiClient";
import DiffMatchPatch from "diff-match-patch";
import debounce from "lodash.debounce";
import automerge from "automerge";

const PROGRAM_ID = "LDnI1Bs-";

const dmp = new DiffMatchPatch();

function App() {
    const [programId, setProgramId] = useState(PROGRAM_ID);
    const [content, setContent] = useState("");
    const monacoRef = useRef(null);
    const doc = useRef(null);

    const handleChange = debounce((prevValue, value) => {
        console.log("PREV CONTENT: " + prevValue);
        console.log("CHANGE: " + value);
        const patches = dmp.patch_make(prevValue, value);
        const newDoc = automerge.change(doc.current, docRef => {
            patches.forEach(patch => {
                let idx = patch.start1;
                patch.diffs.forEach(([operation, changeText]) => {
                    switch (operation) {
                        case 1: // Insertion
                            docRef.content.insertAt(
                                idx,
                                ...changeText.split("")
                            );
                        case 0: // No Change
                            idx += changeText.length;
                            break;
                        case -1: // Deletion
                            for (let i = 0; i < changeText.length; i++) {
                                docRef.content.deleteAt(idx);
                            }
                            break;
                    }
                });
            });
        });
        const changes = automerge.getChanges(doc.current, newDoc);
        doc.current = newDoc;
        sendProgramChanges(programId, JSON.stringify(changes));
        setContent(doc.current.content.toString());
    }, 700);

    useEffect(() => {
        sendInitMessage(programId);

        wsClient.onmessage = ev => {
            const message = JSON.parse(ev.data);
            console.log("Received WS Message:  " + message.type);
            console.log("Message data: " + message.data);
            if (message.type === WS_MESSAGE_TYPES.server_request_id) {
                sendInitMessage(programId);
            } else if (message.type === WS_MESSAGE_TYPES.server_doc) {
                doc.current = automerge.load(message.data.doc);
                setContent(doc.current.content.toString());
            } else if (message.type === WS_MESSAGE_TYPES.server_doc_changes) {
                doc.current = automerge.applyChanges(
                    doc.current,
                    JSON.parse(message.data.changes)
                );
                console.log(doc.current.content.toString());
                setContent(doc.current.content.toString());
            }
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
