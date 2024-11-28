import React from "react";
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

export interface ColumnType {
  name: string;
  type: string;
}
const DUCKDB_TYPES = ["INTEGER", "DOUBLE", "BOOLEAN", "TEXT"];

interface InputSectionProps {
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
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
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #ddd",
        padding: "10px",
        height: "90%",
      }}
    >
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
            Upload CSV
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
                    <select
                      value={columnTypes[index]?.type || "TEXT"}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      style={{ marginLeft: "10px" }}
                    >
                      {DUCKDB_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
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
