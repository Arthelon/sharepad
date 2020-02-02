import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Editor from "./Editor";
import {
    sendInitMessage,
    closeWs,
    sendProgramChanges,
    wsClient,
    WS_MESSAGE_TYPES
} from "../apiClient";
import DiffMatchPatch from "diff-match-patch";
import { useDebouncedCallback } from "use-debounce";
import automerge from "automerge";

const dmp = new DiffMatchPatch();

function EditorContainer({ programId }) {
    const [content, setContent] = useState("");
    const editorRef = useRef(null);
    const doc = useRef(null);

    const [handleChange, _, flushChangeHandler] = useDebouncedCallback(
        value => {
            const prevValue = doc.current.content.toString();
            console.log("PREV CONTENT: " + prevValue);
            console.log("CHANGE: " + value);
            const patches = dmp.patch_make(prevValue, value);
            let startIdx = -1;
            let changeLength = 0;
            const newDoc = automerge.change(doc.current, docRef => {
                console.log(patches);
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
            sendProgramChanges(programId, {
                changes: JSON.stringify(changes),
                startIdx,
                changeLength
            });
            setContent(doc.current.content.toString());
        },
        700
    );

    useEffect(() => {
        wsClient.onmessage = ev => {
            const message = JSON.parse(ev.data);
            console.log("Received WS Message:  " + message.type);
            if (message.type === WS_MESSAGE_TYPES.server_request_id) {
                sendInitMessage(programId);
            } else if (message.type === WS_MESSAGE_TYPES.server_doc) {
                doc.current = automerge.load(message.data.doc);
                setContent(doc.current.content.toString());
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
        };
        return () => {
            closeWs();
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
EditorContainer.propTypes = {
    programId: PropTypes.string.isRequired
};

export default EditorContainer;
