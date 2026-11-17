import type { ImportResult } from '../types';

interface Props {
  result: ImportResult;
  onClose: () => void;
}

// ImportResults summarises an upload: totals, whether data was committed, and a
// per-row table of every rejection with its reason.
export function ImportResults({ result, onClose }: Props) {
  const { total_rows, imported, rejected, committed, rejections } = result;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import summary</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="summary-row">
          <Stat label="Total rows" value={total_rows} />
          <Stat label="Imported" value={imported} tone="good" />
          <Stat label="Rejected" value={rejected} tone={rejected > 0 ? 'bad' : undefined} />
        </div>

        <div className={`commit-banner ${committed ? 'ok' : 'none'}`}>
          {committed
            ? `${imported} asset${imported === 1 ? '' : 's'} were committed to the database.`
            : 'No data was committed.'}
          {rejected > 0 && committed && ' Rejected rows were skipped (partial import).'}
        </div>

        {rejections.length > 0 && (
          <div className="rejections">
            <h3>Rejections ({rejections.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="col-row">CSV row</th>
                    <th className="col-id">Asset ID</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {rejections.map((r, i) => (
                    <tr key={i}>
                      <td className="col-row">{r.row}</td>
                      <td className="col-id">{r.asset_id || <span className="muted">—</span>}</td>
                      <td>{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'good' | 'bad' }) {
  return (
    <div className={`stat ${tone ?? ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
