import React, { useEffect, useRef, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import Papa from 'papaparse';
import Editor from './Editor';
import * as monaco from 'monaco-editor';
const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
// TODO: add support for other types
// https://duckdb.org/docs/sql/data_types/overview.html
const DUCKDB_TYPES = ['INTEGER', 'DOUBLE', 'BOOLEAN', 'TEXT'];

interface ColumnType {
  name: string;
  type: string;
}
interface Output {
  data?: Record<string, unknown>[];
  message?: string;
}
function App() {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, string | null>[]>([]);
  const [csvData, setCsvData] = useState<Record<string, string | null>[]>([]);
  const [columnTypes, setColumnTypes] = useState<ColumnType[]>([]);
  const [tableName, setTableName] = useState<string>('');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    async function initializeDuckDB() {
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: 'text/javascript',
        })
      );
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      const dbInstance = new duckdb.AsyncDuckDB(logger, worker);
      await dbInstance.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(worker_url);
      setDb(dbInstance);
    }

    initializeDuckDB();
  }, []);

  useEffect(() => {
    console.log('Output:', output);
  }, [output]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setOutput({ message: 'No file selected.' });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string | null>[];
        setCsvData(data);
        setCsvPreview(data.slice(0, 5));
        setTableName(file.name.replace('.csv', ''));
        const inferredTypes = inferColumnTypes(data);
        setColumnTypes(
          Object.keys(data[0] || {}).map((column, index) => ({
            name: column,
            type: inferredTypes[index] || 'TEXT',
          }))
        );
      },
    });
  };
  const inferColumnTypes = (data: Record<string, string | null>[]) => {
    return Object.keys(data[0] || {}).map((column) => {
      const values = data.map((row) => row[column]);
      if (values.every((value) => /^\d+$/.test(value || ''))) {
        return 'INTEGER';
      }
      if (values.every((value) => /^\d+\.\d+$/.test(value || ''))) {
        return 'DOUBLE';
      }
      if (values.every((value) => value === 'true' || value === 'false')) {
        return 'BOOLEAN';
      }
      return 'TEXT';
    });
  };

  const handleTypeChange = (index: number, newType: string) => {
    const updatedTypes = [...columnTypes];
    updatedTypes[index].type = newType;
    setColumnTypes(updatedTypes);
  };

  const createTable = async () => {
    if (!db || !csvData || columnTypes.length === 0 || !tableName) {
      setOutput({ message: 'Missing data, table name, or database is not initialized.' });
      return;
    }

    const conn = await db.connect();
    try {
      const columnsDef = columnTypes
        .map(({ name, type }) => `${name} ${type}`)
        .join(', ');
      const createTableQuery = `CREATE TABLE "${tableName}" (${columnsDef});`;
      await conn.query(createTableQuery);

      const insertRows = csvData.map((row) =>
        `(${Object.values(row)
          .map((value) => (value === null ? 'NULL' : `'${String(value).replace("'", "''")}'`))
          .join(', ')})`
      );
      const insertQuery = `INSERT INTO "${tableName}" VALUES ${insertRows.join(', ')};`;
      await conn.query(insertQuery);

      setOutput({ message: `Table "${tableName}" created successfully with all rows.` });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setOutput({ message: `Error: ${error.message}` });
      } else {
        setOutput({ message: 'An unknown error occurred' });
      }
    } finally {
      await conn.close();
    }
  };
  const runQuery = async () => {
    if (!db) {
      setOutput({ message: 'Database is not initialized.' });
      return;
    }

    if (!editorRef.current) {
      setOutput({ message: 'Editor is not initialized.' });
      return;
    }

    const query = editorRef.current.getValue();
    const conn = await db.connect();
    try {
      const result = await conn.query(query);
      const resultArray = result.toArray();
      setOutput({ data: resultArray.length ? resultArray : [{ message: 'No data returned' }] });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setOutput({ message: `Error: ${error.message}` });
      } else {
        setOutput({ message: 'An unknown error occurred' });
      }
    } finally {
      await conn.close();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* Input Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #ddd',
          padding: '10px',
          height: '90%',
        }}
      >
        <h2 style={{ margin: 0, paddingBottom: '10px' }}>Input</h2>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Editor editorRef={editorRef} runQuery={runQuery} />
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <span
              style={{
                display: 'inline-block',
                padding: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Upload CSV
            </span>
          </label>
          <button
            onClick={runQuery}
            style={{
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Run Query (CTRL+ENTER)
          </button>
        </div>
        {csvPreview && (
          <div
            style={{
              flexGrow: 0,
              overflowY: 'auto',
              marginTop: '4px',
              maxHeight: '24vh',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3>Upload CSV Preview</h3>
              <button
                onClick={createTable}
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
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
              style={{ marginBottom: '8px', padding: '8px', width: '80%' }}
            />
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {Object.keys(csvPreview[0] || {}).map((column, index) => (
                    <th key={index}>
                      {column}
                      <select
                        value={columnTypes[index]?.type || 'TEXT'}
                        onChange={(e) => handleTypeChange(index, e.target.value)}
                        style={{ marginLeft: '10px' }}
                      >
                        {DUCKDB_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex}>{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </div>

      {/* Output Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '10px',
        }}
      >
        <h2 style={{ margin: 0, paddingBottom: '10px' }}>Output</h2>
        {output?.data ? (
          <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {Object.keys(output.data[0] || {}).map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {output.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex}>
                      {typeof value === 'number' ? value : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre
            style={{
              flex: 1,
              backgroundColor: '#f4f4f4',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflowY: 'scroll',
            }}
          >
            {output?.message || 'No results to display.'}
          </pre>
        )}

      </div>
    </div>
  );
}
export default App;