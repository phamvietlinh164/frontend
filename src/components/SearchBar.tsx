import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { Asset, AssetType } from '../types';
import { ASSET_TYPE_LABELS } from '../types';
import { TypeBadge } from './Badges';

interface Props {
  onSelect: (id: string) => void;
}

const TYPES: AssetType[] = ['SUBSTATION', 'TRANSFORMER', 'LV_BOARD', 'SWITCHBOARD', 'SWITCHBOARD_PANEL'];

// SearchBar does exact/partial search by id or name, optionally filtered by
// type. Queries are debounced; results appear in a dropdown and selecting one
// navigates to that asset.
export function SearchBar({ onSelect }: Props) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced search when query or type changes.
  useEffect(() => {
    if (q.trim() === '' && type === '') {
      setResults([]);
      setOpen(false);
      return;
    }
    // Guard against stale responses: if the query changes (or the component
    // unmounts) before an in-flight search resolves, ignore its result so an
    // older request can never overwrite a newer one.
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      api
        .search(q.trim(), type)
        .then((r) => {
          if (cancelled) return;
          setResults(r);
          setOpen(true);
        })
        .catch((e) => {
          if (!cancelled) setError(e.message ?? 'Search failed');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [q, type]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function choose(id: string) {
    setOpen(false);
    onSelect(id);
  }

  return (
    <div className="search" ref={boxRef}>
      <div className="search-inputs">
        <input
          type="text"
          placeholder="Search by ID or name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search assets"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {ASSET_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {open && (
        <div className="search-results">
          {loading && <div className="search-state">Searching…</div>}
          {error && <div className="search-state error">{error}</div>}
          {!loading && !error && results.length === 0 && <div className="search-state">No matches.</div>}
          {results.map((a) => (
            <button key={a.asset_id} className="search-result" onClick={() => choose(a.asset_id)}>
              <TypeBadge type={a.asset_type} />
              <span className="sr-name">{a.asset_name}</span>
              <span className="sr-id">{a.asset_id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
