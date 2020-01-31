import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import MonacoWrapper from "./MonacoWrapper";

const editorOptions = {
    fontSize: 14,
    automaticLayout: true,
    scrollBeyondLastLine: false
};

const Editor = ({ content, onChange, monacoRef }) => {
    const willMount = monacoInst => {
        monacoRef.current = monacoInst;
    };

    return (
        <MonacoWrapper
            language="javascript"
            theme="vs-dark"
            editorWillMount={willMount}
            options={editorOptions}
            onChange={onChange}
            value={content}
        />
    );
};
Editor.propTypes = {
    content: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    monacoRef: PropTypes.object.isRequired
};

export default Editor;
