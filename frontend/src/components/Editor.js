import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import MonacoEditor from "react-monaco-editor";
import { debounce } from "../utils";

const editorOptions = {
    fontSize: 14,
    automaticLayout: true,
    scrollBeyondLastLine: false
};

function Editor({ content, onChange }) {
    const monaco = useRef(null);
    const willMount = monacoInst => {
        monaco.current = monacoInst;
    };
    console.log(content);
    const handleChange = debounce(onChange, 700);

    return (
        <MonacoEditor
            language="javascript"
            theme="vs-dark"
            editorWillMount={willMount}
            options={editorOptions}
            onChange={handleChange}
            value={content}
        />
    );
}
Editor.propTypes = {
    content: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default Editor;
