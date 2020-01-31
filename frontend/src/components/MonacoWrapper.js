import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import PropTypes from "prop-types";
import React, { useState, useRef, useEffect } from "react";

// Custom modification of 'react-monaco-editor' package

const noop = () => {};
const processSize = size => {
    return !/^\d+$/.test(size) ? size : `${size}px`;
};

const MonacoWrapper = props => {
    const containerRef = useRef(null);
    const editorRef = useRef(null);
    const preventTriggerChange = useRef(false);
    useEffect(() => {
        // Initialize monaco instance
        const value = props.value != null ? props.value : props.defaultValue;
        const { language, theme, options, overrideServices } = props;
        if (containerRef.current) {
            // Before initializing monaco editor
            const parentOptions = props.editorWillMount(monaco);
            Object.assign(options, parentOptions);
            const editor = monaco.editor.create(
                containerRef.current,
                {
                    value,
                    language,
                    ...options,
                    ...(theme ? { theme } : {})
                },
                overrideServices
            );
            editorRef.current = editor;

            props.editorDidMount(editor, monaco);
            // Subscribe to editor changes

            return () => {
                if (editor) {
                    editor.dispose();
                    const model = editor.getModel();
                    if (model) {
                        model.dispose();
                    }
                }
            };
        }
    }, []);

    // Respond to value changes
    useEffect(() => {
        const value = props.value;
        const editor = editorRef.current;
        const model = editor.getModel();
        if (value != null && value !== model.getValue()) {
            preventTriggerChange.current = true;
            editor.pushUndoStop();
            model.pushEditOperations(
                [editor.getSelection()],
                [
                    {
                        range: model.getFullModelRange(),
                        text: value
                    }
                ]
            );
            editor.pushUndoStop();
            preventTriggerChange.current = false;
        }
        const subscription = editorRef.current.onDidChangeModelContent(
            event => {
                if (!preventTriggerChange.current) {
                    props.onChange(value, editor.getValue(), event);
                }
            }
        );

        return () => {
            if (subscription) {
                subscription.dispose();
            }
        };
    }, [props.value]);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.layout();
        }
    }, [props.width, props.height]);

    const fixedWidth = processSize(props.width);
    const fixedHeight = processSize(props.height);
    const style = {
        width: fixedWidth,
        height: fixedHeight
    };

    return (
        <div
            ref={containerRef}
            style={style}
            className="react-monaco-editor"
        ></div>
    );
};

MonacoWrapper.defaultProps = {
    width: "100%",
    height: "100%",
    value: null,
    defaultValue: "",
    language: "javascript",
    theme: null,
    options: {},
    overrideServices: {},
    editorDidMount: noop,
    editorWillMount: noop,
    onChange: noop
};
MonacoWrapper.propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    language: PropTypes.string,
    theme: PropTypes.string,
    options: PropTypes.object,
    overrideServices: PropTypes.object,
    editorDidMount: PropTypes.func,
    editorWillMount: PropTypes.func,
    onChange: PropTypes.func
};

export default MonacoWrapper;
