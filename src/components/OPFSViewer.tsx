import React, { useState } from 'react';

type FileSystemEntry = {
  name: string;
  kind: 'directory' | 'file';
  children?: FileSystemEntry[];
};

/** read directory recursively */
async function readDirectory(
  dirHandle: FileSystemDirectoryHandle
): Promise<FileSystemEntry> {
  const result: FileSystemEntry = {
    name: '(root)',
    kind: 'directory',
    children: [],
  };

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'directory') {
      const subDirHandle = handle as FileSystemDirectoryHandle;
      await subDirHandle.requestPermission({ mode: 'read' });
      const child = await traverseDirectory(subDirHandle, name);
      result.children?.push(child);
    } else if (handle.kind === 'file') {
      result.children?.push({
        name,
        kind: 'file',
      });
    }
  }

  return result;
}

async function traverseDirectory(
  dirHandle: FileSystemDirectoryHandle,
  dirName: string
): Promise<FileSystemEntry> {
  const entry: FileSystemEntry = {
    name: dirName,
    kind: 'directory',
    children: [],
  };

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'directory') {
      const subDirHandle = handle as FileSystemDirectoryHandle;
      await subDirHandle.requestPermission({ mode: 'read' });
      const child = await traverseDirectory(subDirHandle, name);
      entry.children?.push(child);
    } else if (handle.kind === 'file') {
      entry.children?.push({
        name,
        kind: 'file',
      });
    }
  }

  return entry;
}

const FileSystemTree: React.FC<{ entry: FileSystemEntry }> = ({ entry }) => {
  if (!entry) return null;

  return (
    <ul style={{ listStyle: 'none', marginLeft: '1rem' }}>
      <li>
        {entry.kind === 'directory' ? '📁 ' : '📄 '}
        <strong>{entry.name}</strong>
      </li>
      {entry.children &&
        entry.children.map((child, idx) => (
          <li key={idx}>
            <FileSystemTree entry={child} />
          </li>
        ))}
    </ul>
  );
};

const OPFSViewer: React.FC = () => {
  const [tree, setTree] = useState<FileSystemEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoadOPFS = async () => {
    setError(null);
    try {
      const rootHandle = await navigator.storage.getDirectory();
      await rootHandle.requestPermission({ mode: 'read' });
      const fsTree = await readDirectory(rootHandle);
      setTree(fsTree);
    } catch (err) {
      console.error(err);
      setError('error while reading OPFS');
    }
  };

  return (
    <div>
      <h1>OPFS Viewer</h1>
      <button onClick={handleLoadOPFS}>READ OPFS</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tree && (
        <div style={{ marginTop: '1rem' }}>
          <FileSystemTree entry={tree} />
        </div>
      )}
    </div>
  );
};

export default OPFSViewer;
