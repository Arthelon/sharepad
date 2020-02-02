import React from "react";
import PropTypes from "prop-types";
import MonacoWrapper from "./MonacoWrapper";

const editorOptions = {
    fontSize: 14,
    automaticLayout: true,
    scrollBeyondLastLine: false
};

const Editor = ({ content, onChange, editorRef }) => {
    const didMount = editor => {
        editorRef.current = editor;
    };

    return (
        <MonacoWrapper
            language="javascript"
            theme="vs-dark"
            editorDidMount={didMount}
            options={editorOptions}
            onChange={onChange}
            value={content}
        />
    );
};
Editor.propTypes = {
    content: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    editorRef: PropTypes.object.isRequired
};

export default Editor;
