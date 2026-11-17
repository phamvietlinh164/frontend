import { useRef, useState } from 'react';
import { api } from '../lib/api';
import type { ImportResult } from '../types';

interface Props {
  onImported: (result: ImportResult) => void;
}

// UploadPanel lets the user pick (or drag-and-drop) a CSV and sends it to the
// backend for validation + import. It surfaces loading and error states and
// hands the result back to the parent to display.
export function UploadPanel({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setFileName(file.name);
    try {
      const result = await api.importCsv(file);
      onImported(result);
    } catch (e) {
      setError((e as Error).message ?? 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void upload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  return (
    <div className="upload">
      <div
        className={`dropzone${dragging ? ' dragging' : ''}${busy ? ' busy' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !busy && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={onFileChosen} />
        {busy ? (
          <span>Importing {fileName}…</span>
        ) : (
          <>
            <strong>Upload CSV</strong>
            <span className="muted">Click or drag a grid_assets.csv file here</span>
          </>
        )}
      </div>
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
}
