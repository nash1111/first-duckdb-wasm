import React, { useState } from "react";
import Editor from "../Editor";
import * as monaco from "monaco-editor";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ColumnType {
  name: string;
  type: string;
}
const DUCKDB_TYPES = [
  // Numeric Types
  "TINYINT", "SMALLINT", "INTEGER", "BIGINT", "HUGEINT",
  "UTINYINT", "USMALLINT", "UINTEGER", "UBIGINT", "UHUGEINT",
  "DECIMAL", "FLOAT", "DOUBLE",
  // String Types
  "VARCHAR", "TEXT", "CHAR", "BIT",
  // Boolean Type
  "BOOLEAN",
  // Date/Time Types
  "DATE", "TIME", "TIMESTAMP", "TIMESTAMP WITH TIME ZONE", "INTERVAL",
  // Binary Types
  "BLOB", "BYTEA", "BINARY", "VARBINARY",
  // Other Types
  "UUID", "JSON",
  // Nested Types
  "ARRAY", "LIST", "MAP", "STRUCT", "UNION"
];

interface InputSectionProps {
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  runQuery: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  csvPreview: Record<string, string | null>[];
  columnTypes: ColumnType[];
  handleTypeChange: (index: number, newType: string) => void;
  createTable: () => void;
  tableName: string;
  setTableName: React.Dispatch<React.SetStateAction<string>>;
}

const InputSection: React.FC<InputSectionProps> = ({
  editorRef,
  runQuery,
  handleFileUpload,
  csvPreview,
  columnTypes,
  handleTypeChange,
  createTable,
  tableName,
  setTableName,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "text/csv") {
      const event = {
        target: {
          files: files,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #ddd",
        padding: "10px",
        height: "90%",
        position: "relative",
        backgroundColor: isDragging ? "rgba(0, 123, 255, 0.1)" : "transparent",
        transition: "background-color 0.3s ease",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 123, 255, 0.1)",
            border: "2px dashed #007bff",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Drop CSV file here
          </div>
        </div>
      )}
      <h2 style={{ margin: 0, paddingBottom: "10px" }}>Input</h2>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Editor editorRef={editorRef} runQuery={runQuery} />
      </div>
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <span
            style={{
              display: "inline-block",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Upload CSV(Choose file or Drag and Drop)
          </span>
        </label>
        <Button onClick={runQuery}>Run Query (CTRL+ENTER)</Button>
      </div>
      {csvPreview && (
        <div
          style={{
            flexGrow: 0,
            overflowY: "auto",
            marginTop: "4px",
            maxHeight: "24vh",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3>Upload CSV Preview</h3>
            <button
              onClick={createTable}
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Confirm table name, column types and Create Table
            </button>
          </div>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
            style={{ marginBottom: "8px", padding: "8px", width: "80%" }}
          />
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(csvPreview[0] || {}).map((column, index) => (
                  <TableHead key={index}>
                    {column}
                    <Select
                      value={columnTypes[index]?.type || "TEXT"}
                      onValueChange={(value) => handleTypeChange(index, value)}
                    >
                      <SelectTrigger className="w-[180px] ml-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DUCKDB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvPreview.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <TableCell key={colIndex}>{String(value)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InputSection;
