import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "./Editor";
import WebsocketClient, { WS_MESSAGE_TYPES } from "../wsClient";
import DiffMatchPatch from "diff-match-patch";
import { useDebouncedCallback } from "use-debounce";
import automerge from "automerge";

const dmp = new DiffMatchPatch();

function EditorContainer() {
    const { programId } = useParams();
    const [content, setContent] = useState("");
    const editorRef = useRef(null);
    const doc = useRef(null);
    const wsClient = useRef(null);

    const [handleChange, _, flushChangeHandler] = useDebouncedCallback(
        value => {
            const prevValue = doc.current.content.toString();
            console.log("PREV CONTENT: " + prevValue);
            console.log("CHANGE: " + value);
            const patches = dmp.patch_make(prevValue, value);
            let startIdx = -1;
            let changeLength = 0;
            const newDoc = automerge.change(doc.current, docRef => {
                patches.forEach(patch => {
                    let idx = patch.start1;
                    patch.diffs.forEach(([operation, changeText]) => {
                        switch (operation) {
                            case 1: // Insertion
                                if (startIdx === -1) {
                                    startIdx = idx;
                                }
                                docRef.content.insertAt(
                                    idx,
                                    ...changeText.split("")
                                );
                                changeLength += changeText.length;
                            case 0: // No Change
                                idx += changeText.length;
                                break;
                            case -1: // Deletion
                                if (startIdx === -1) {
                                    startIdx = idx;
                                }
                                for (let i = 0; i < changeText.length; i++) {
                                    docRef.content.deleteAt(idx);
                                }
                                changeLength -= changeText.length;
                                break;
                        }
                    });
                });
            });
            const changes = automerge.getChanges(doc.current, newDoc);
            doc.current = newDoc;
            wsClient.current.sendProgramChanges(programId, {
                changes: JSON.stringify(changes),
                startIdx,
                changeLength
            });
            setContent(doc.current.content.toString());
        },
        700
    );

    useEffect(() => {
        editorRef.current.updateOptions({
            readOnly: true
        });
        wsClient.current = new WebsocketClient();
        wsClient.current.onMessage(ev => {
            const message = JSON.parse(ev.data);
            console.log("Received WS Message:  " + message.type);
            if (message.type === WS_MESSAGE_TYPES.server_request_id) {
                wsClient.current.sendInitMessage(programId);
            } else if (message.type === WS_MESSAGE_TYPES.server_doc) {
                doc.current = automerge.load(message.data.doc);
                setContent(doc.current.content.toString());
                editorRef.current.updateOptions({
                    readOnly: false
                });
            } else if (message.type === WS_MESSAGE_TYPES.server_doc_changes) {
                setTimeout(() => {
                    flushChangeHandler();
                    const { changes, startIdx, changeLength } = message.data;
                    doc.current = automerge.applyChanges(
                        doc.current,
                        JSON.parse(changes)
                    );
                    const editor = editorRef.current;
                    const model = editor.getModel();
                    let offset = model.getOffsetAt(editor.getPosition());
                    console.log("Old Offset " + offset);
                    console.log(startIdx);
                    if (offset > startIdx) {
                        offset += changeLength;
                    }

                    setContent(doc.current.content.toString());

                    // Set new cursor position
                    document.activeElement.blur();
                    setTimeout(() => {
                        editor.focus();
                        console.log("New Offset: " + offset);
                        const newPosition = model.getPositionAt(offset);
                        editor.setPosition(newPosition);
                        editor.setSelection({
                            startLineNumber: newPosition.lineNumber,
                            endLineNumber: newPosition.lineNumber,
                            startColumn: newPosition.column,
                            endColumn: newPosition.column
                        });
                    }, 1);
                }, 1);
            }
        });
        return () => {
            wsClient.current.close();
        };
    }, []);

    return (
        <Editor
            content={content}
            onChange={handleChange}
            editorRef={editorRef}
        />
    );
}

export default EditorContainer;
