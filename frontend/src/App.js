import React, { useEffect, useState, useRef } from "react";
import Editor from "./components/Editor";
import {
    getProgram,
    sendInitMessage,
    closeWs,
    updateDoc,
    wsClient
} from "./apiClient";
import DiffMatchPatch from "diff-match-patch";
import debounce from "lodash.debounce";
import automerge from "automerge";

const PROGRAM_ID = "LDnI1Bs-";

const dmp = new DiffMatchPatch();

function App() {
    const [content, setContent] = useState("");
    const monacoRef = useRef(null);
    const doc = useRef(null);

    const handleChange = debounce(value => {
        const patches = dmp.patch_make(content, value);
        const newDoc = automerge.change(doc.current, docRef => {
            patches.forEach(patch => {
                let idx = patch.start1;
                patch.diffs.forEach(([operation, changeText]) => {
                    console.log("Doc Change: " + docRef.content);
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
        updateDoc(PROGRAM_ID, JSON.stringify(changes));
        setContent(doc.current.content.toString());
    }, 700);

    useEffect(() => {
        getProgram(PROGRAM_ID).then(resp => {
            if (resp && resp.data) {
                const serializedDoc = resp.data.data.doc;
                doc.current = automerge.load(serializedDoc);
                setContent(doc.current.content.toString());
                sendInitMessage(PROGRAM_ID);
            }
        });

        wsClient.onmessage = ev => {
            const changes = JSON.parse(ev.data);
            doc.current = automerge.applyChanges(doc.current, changes);
            console.log(doc.current.content.toString());
            setContent(doc.current.content.toString());
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
