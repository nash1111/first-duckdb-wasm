import React, { useEffect, useState } from "react";
import * as monaco from "monaco-editor";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditorProps {
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
  runQuery: () => void;
}

const Editor: React.FC<EditorProps> = ({ editorRef, runQuery }) => {
  const defaultFontSize = 20;
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [theme, setTheme] = useState("vs-dark");

  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme);
    }
  }, [theme, editorRef]);

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  useEffect(() => {
    const editorElement = document.getElementById("editor");
    if (editorElement) {
      editorRef.current = monaco.editor.create(editorElement, {
        value: "",
        language: "sql",
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: defaultFontSize,
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
      editorRef.current.updateOptions({ fontSize: fontSize });
    }
  }, [fontSize, editorRef]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          runQuery();
        },
      );
    }
  }, [runQuery, editorRef]);

  const increaseFontSize = () => {
    setFontSize((prevSize) => prevSize + 1);
  };

  const decreaseFontSize = () => {
    setFontSize((prevSize) => Math.max(prevSize - 1, 1));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}
      >
        <span>Font Size: {fontSize}</span>
        <button onClick={increaseFontSize} style={{ marginLeft: "8px" }}>
          ▲
        </button>
        <button onClick={decreaseFontSize} style={{ marginLeft: "4px" }}>
          ▼
        </button>
        <Select onValueChange={handleThemeChange} value={theme}>
          <SelectTrigger className="w-[180px] ml-2">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="vs">VS Light</SelectItem>
              <SelectItem value="vs-dark">VS Dark</SelectItem>
              <SelectItem value="hc-black">High Contrast Dark</SelectItem>
              <SelectItem value="hc-light">High Contrast Light</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div
        id="editor"
        style={{
          flex: 1,
          border: "1px solid #ddd",
          borderRadius: "8px",
          height: "10vh",
        }}
      ></div>
    </div>
  );
};

export default Editor;
