import React, { useState, useEffect, useCallback } from "react";

type FileSystemEntry = {
  name: string;
  kind: "directory" | "file";
  children?: FileSystemEntry[];
};

async function readDirectory(
  dirHandle: FileSystemDirectoryHandle,
  currentName = "(root)",
): Promise<FileSystemEntry> {
  const entry: FileSystemEntry = {
    name: currentName,
    kind: "directory",
    children: [],
  };
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "directory") {
      const subEntry = await readDirectory(handle, name);
      entry.children?.push(subEntry);
    } else if (handle.kind === "file") {
      entry.children?.push({
        name,
        kind: "file",
      });
    }
  }
  return entry;
}

async function readFile(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string,
): Promise<string> {
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: false });
  const fileData = await fileHandle.getFile();
  return fileData.text();
}

async function writeFile(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string,
  content: string,
) {
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

async function deleteEntry(
  dirHandle: FileSystemDirectoryHandle,
  entryName: string,
  isDirectory?: boolean,
) {
  await dirHandle.removeEntry(entryName, { recursive: isDirectory });
}

async function deleteAll(dirHandle: FileSystemDirectoryHandle) {
  for await (const [name, handle] of dirHandle.entries()) {
    await dirHandle.removeEntry(name, {
      recursive: handle.kind === "directory",
    });
  }
}

const FileSystemTree: React.FC<{
  entry: FileSystemEntry;
  onClickFile: (fileName: string) => void;
  onDelete: (entryName: string, isDir: boolean) => void;
}> = ({ entry, onClickFile, onDelete }) => {
  if (!entry) return null;

  return (
    <ul style={{ listStyle: "none", marginLeft: "1rem" }}>
      <li>
        {entry.kind === "directory" ? "📁" : "📄"} <strong>{entry.name}</strong>{" "}
        {entry.name !== "(root)" && (
          <button
            style={{ marginLeft: "8px", color: "red" }}
            onClick={() => onDelete(entry.name, entry.kind === "directory")}
          >
            Delete
          </button>
        )}
      </li>
      {entry.children &&
        entry.children.map((child, idx) => (
          <li key={idx}>
            {child.kind === "file" ? (
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => onClickFile(child.name)}
              >
                📄 {child.name}
              </span>
            ) : (
              <FileSystemTree
                entry={child}
                onClickFile={onClickFile}
                onDelete={onDelete}
              />
            )}
            {child.kind === "file" && (
              <button
                style={{ marginLeft: "8px", color: "red" }}
                onClick={() => onDelete(child.name, false)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
    </ul>
  );
};

const OPFSViewer: React.FC = () => {
  const [rootHandle, setRootHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [tree, setTree] = useState<FileSystemEntry | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadOPFS = useCallback(async () => {
    setError(null);
    try {
      const dirHandle = await navigator.storage.getDirectory();
      await dirHandle.requestPermission({ mode: "readwrite" });
      setRootHandle(dirHandle);

      const treeData = await readDirectory(dirHandle);
      setTree(treeData);
    } catch (err) {
      console.error(err);
      setError("Error while reading OPFS");
    }
  }, []);

  const reloadTree = useCallback(async () => {
    if (!rootHandle) return;
    const treeData = await readDirectory(rootHandle);
    setTree(treeData);
  }, [rootHandle]);

  const handleClickFile = useCallback(
    async (fileName: string) => {
      if (!rootHandle) return;
      setFileName(fileName);
      try {
        const content = await readFile(rootHandle, fileName);
        setFileContent(content);
      } catch (err) {
        console.error(err);
        setError(`file load error: ${fileName}`);
      }
    },
    [rootHandle],
  );

  const handleWriteFile = useCallback(async () => {
    if (!rootHandle) return;
    setError(null);
    try {
      if (!newFileName) {
        setError("insert file name");
        return;
      }
      await writeFile(rootHandle, newFileName, newFileContent);
      setNewFileName("");
      setNewFileContent("");
      await reloadTree();
      alert(`"${newFileName}" created/updated`);
    } catch (err) {
      console.error(err);
      setError("Error while writing file");
    }
  }, [rootHandle, newFileName, newFileContent, reloadTree]);

  const handleDelete = useCallback(
    async (entryName: string, isDir: boolean) => {
      if (!rootHandle) return;
      if (!window.confirm(`Are you sure to delete "${entryName}" ?`)) return;
      try {
        await deleteEntry(rootHandle, entryName, isDir);
        await reloadTree();
      } catch (err) {
        console.error(err);
        setError(`deletion error: ${entryName}`);
      }
    },
    [rootHandle, reloadTree],
  );

  const handleDeleteAll = useCallback(async () => {
    if (!rootHandle) return;
    if (!window.confirm("DELETE ALL FILES/FOLDERS ON OPFS ?")) return;
    try {
      await deleteAll(rootHandle);
      await reloadTree();
    } catch (err) {
      console.error(err);
      setError("Error while deleting all files");
    }
  }, [rootHandle, reloadTree]);

  const handleUploadCSV = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!rootHandle) return;
      setError(null);

      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        await writeFile(rootHandle, file.name, content);
        await reloadTree();
        alert(`File "${file.name}" was uploaded to OPFS`);
      } catch (err) {
        console.error(err);
        setError("Error while uploading CSV");
      } finally {
        e.target.value = "";
      }
    },
    [rootHandle, reloadTree],
  );

  useEffect(() => {
    loadOPFS();
  }, [loadOPFS]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>OPFS Viewer</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ margin: "1rem 0" }}>
        <button onClick={reloadTree}>Reload Tree</button>
        <button style={{ marginLeft: 8 }} onClick={handleDeleteAll}>
          DELETE ALL
        </button>
      </div>

      {tree && (
        <div>
          <FileSystemTree
            entry={tree}
            onClickFile={handleClickFile}
            onDelete={handleDelete}
          />
        </div>
      )}

      <hr />

      <h2>Read File</h2>
      <p>
        <strong>Selected File:</strong> {fileName || "(none)"}
      </p>
      <textarea
        style={{ width: "100%", height: "100px" }}
        readOnly
        value={fileContent}
        placeholder="click to load"
      />

      <hr />

      <h2>Write File</h2>
      <div>
        <label style={{ display: "block", marginBottom: "4px" }}>
          File Name
        </label>
        <input
          style={{ width: "100%" }}
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="example.txt"
        />
      </div>
      <div style={{ marginTop: "8px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          File Content
        </label>
        <textarea
          style={{ width: "100%", height: "80px" }}
          value={newFileContent}
          onChange={(e) => setNewFileContent(e.target.value)}
          placeholder="insert text here"
        />
      </div>
      <div style={{ marginTop: "8px" }}>
        <button onClick={handleWriteFile}>Save File</button>
      </div>
      <hr />
      <h2>Upload CSV</h2>
      <input type="file" accept=".csv" onChange={handleUploadCSV} />
    </div>
  );
};

export default OPFSViewer;
