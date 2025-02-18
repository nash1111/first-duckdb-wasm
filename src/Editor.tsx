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
import { Button } from "./components/ui/button";
import { Undo2, Redo2, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface EditorProps {
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  runQuery: () => void;
}

const Editor: React.FC<EditorProps> = ({ editorRef, runQuery }) => {
  const defaultFontSize = 20;
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [theme, setTheme] = useState("vs-dark");
  const { toast } = useToast();

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
        <Button onClick={increaseFontSize} style={{ marginLeft: "8px" }}>
          ▲
        </Button>
        <Button onClick={decreaseFontSize} style={{ marginLeft: "4px" }}>
          ▼
        </Button>
        <Button
          onClick={() => {
            if (editorRef.current) {
              const content = editorRef.current.getValue();
              const timestamp = format(new Date(), "yyyy-MM-dd'T'HHmmssSSS");
              const filename = `${timestamp}.sql`;

              const blob = new Blob([content], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              toast({
                title: "Downloaded",
                description: `File saved as ${filename}`,
              });
            }
          }}
          size="icon"
          variant="outline"
          title="Download SQL"
          className="ml-2"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.trigger("keyboard", "undo", null);
            }
          }}
          size="icon"
          variant="outline"
          title="Undo"
          className="ml-2"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.trigger("keyboard", "redo", null);
            }
          }}
          size="icon"
          variant="outline"
          title="Redo"
          className="ml-2"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
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
