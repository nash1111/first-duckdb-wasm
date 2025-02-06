import React, { useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Papa from "papaparse";
import * as monaco from "monaco-editor";
import InputSection, { ColumnType } from "./components/InputSection";
import OutputSection from "./components/OutputSection";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "./components/ui/toast";
import VisualizeSection from "./components/VisualizeSection";
import * as duckdb from '@duckdb/duckdb-wasm';
//import duckdb_mvp from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
//import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
// TODO: switch automatically
import duckdb_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?worker';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';

export interface Output {
  data?: Record<string, unknown>[];
  message?: string;
}

function App() {
  const { toast } = useToast();
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, string | null>[]>(
    [],
  );
  const [csvData, setCsvData] = useState<Record<string, string | null>[]>([]);
  const [columnTypes, setColumnTypes] = useState<ColumnType[]>([]);
  const [tableName, setTableName] = useState<string>("");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    async function initializeDuckDB() {
      // Select a bundle based on browser checks
      // Instantiate the asynchronus version of DuckDB-wasm
      let worker = new duckdb_worker()
      let logger = new duckdb.ConsoleLogger()
      let db = new duckdb.AsyncDuckDB(logger, worker)
      await db.instantiate(duckdb_wasm)
      await db.open({
        path: 'opfs://duckdb-wasm-parquet.db',
        accessMode: duckdb.DuckDBAccessMode.READ_WRITE,
      })
      setDb(db);
    }

    initializeDuckDB();
  }, []);

  useEffect(() => {
    console.log("Output:", output);
  }, [output]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setOutput({ message: "No file selected." });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string | null>[];
        setCsvData(data);
        setCsvPreview(data.slice(0, 5));
        setTableName(file.name.replace(".csv", ""));
        const inferredTypes = inferColumnTypes(data);
        setColumnTypes(
          Object.keys(data[0] || {}).map((column, index) => ({
            name: column,
            type: inferredTypes[index] || "TEXT",
          })),
        );
      },
    });
  };

  const inferColumnTypes = (data: Record<string, string | null>[]) => {
    return Object.keys(data[0] || {}).map((column) => {
      const values = data.map((row) => row[column]);
      if (values.every((value) => /^\d+$/.test(value || ""))) {
        return "INTEGER";
      }
      if (values.every((value) => /^\d+\.\d+$/.test(value || ""))) {
        return "DOUBLE";
      }
      if (values.every((value) => value === "true" || value === "false")) {
        return "BOOLEAN";
      }
      return "TEXT";
    });
  };

  const handleTypeChange = (index: number, newType: string) => {
    const updatedTypes = [...columnTypes];
    updatedTypes[index].type = newType;
    setColumnTypes(updatedTypes);
  };

  const createTable = async () => {
    if (!db || !csvData || columnTypes.length === 0 || !tableName) {
      setOutput({
        message: "Missing data, table name, or database is not initialized.",
      });
      return;
    }

    const conn = await db.connect();
    try {
      const columnsDef = columnTypes
        .map(({ name, type }) => `${name} ${type}`)
        .join(", ");
      const createTableQuery = `CREATE TABLE "${tableName}" (${columnsDef});`;
      await conn.query(createTableQuery);

      const insertRows = csvData.map(
        (row) =>
          `(${Object.values(row)
            .map((value) =>
              value === null ? "NULL" : `'${String(value).replace("'", "''")}'`,
            )
            .join(", ")})`,
      );
      const insertQuery = `INSERT INTO "${tableName}" VALUES ${insertRows.join(
        ", ",
      )};`;
      await conn.query(insertQuery);

      setOutput({
        message: `Table "${tableName}" created successfully with all rows.`,
      });

      toast({
        title: "Success",
        description: `Table "${tableName}" created successfully.`,
        action: <ToastAction altText="Dismiss">Close</ToastAction>,
      });
    } catch (error: unknown) {
      console.log("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      await conn.close();
    }
  };

  const runQuery = async () => {
    if (!db) {
      setOutput({ message: "Database is not initialized." });
      return;
    }

    if (!editorRef.current) {
      setOutput({ message: "Editor is not initialized." });
      return;
    }

    const query = editorRef.current.getValue();
    const conn = await db.connect();
    try {
      const result = await conn.query(query);
      const resultArray = result.toArray();
      setOutput({
        data: resultArray.length
          ? resultArray
          : [{ message: "No data returned" }],
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setOutput({ message: `Error: ${error.message}` });
      } else {
        setOutput({ message: "An unknown error occurred" });
      }
    } finally {
      await conn.close();
    }
  };

  return (
    <div style={
      {
        height: "100vh",
        width: "100vw"
      }}
    >
      <ResizablePanelGroup direction="horizontal" className="h-screen w-screen">
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full overflow-auto">
            <InputSection
              editorRef={editorRef}
              runQuery={runQuery}
              handleFileUpload={handleFileUpload}
              csvPreview={csvPreview}
              columnTypes={columnTypes}
              handleTypeChange={handleTypeChange}
              createTable={createTable}
              tableName={tableName}
              setTableName={setTableName}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50}>
              <div className="h-full overflow-auto">
                <OutputSection output={output} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="h-full overflow-auto">
                <VisualizeSection output={output} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;
