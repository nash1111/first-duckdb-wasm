import React, { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';

interface EditorProps {
    editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
    runQuery: () => void;
}

const Editor: React.FC<EditorProps> = ({ editorRef, runQuery }) => {
    const [fontSize, setFontSize] = useState(20);

    useEffect(() => {
        const editorElement = document.getElementById('editor');
        if (editorElement) {
            editorRef.current = monaco.editor.create(editorElement, {
                value: '',
                language: 'sql',
                theme: 'vs-dark',
                automaticLayout: true,
                fontSize: fontSize,
            });
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
            }
        };
    }, [editorRef]);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                runQuery();
            });
        }
    }, [editorRef.current, runQuery]);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({ fontSize: fontSize });
        }
    }, [fontSize]);

    const increaseFontSize = () => {
        setFontSize((prevSize) => prevSize + 1);
    };

    const decreaseFontSize = () => {
        setFontSize((prevSize) => Math.max(prevSize - 1, 1));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0px' }}>
                <span>Font Size: {fontSize}</span>
                <button onClick={increaseFontSize} style={{ marginLeft: '8px' }}>▲</button>
                <button onClick={decreaseFontSize} style={{ marginLeft: '4px' }}>▼</button>
            </div>
            <div
                id="editor"
                style={{
                    flex: 1,
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    height: '10vh',
                }}
            ></div>
        </div>
    );
};

export default Editor;