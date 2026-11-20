import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Asset, AssetDetail } from '../types';
import { ASSET_TYPE_LABELS, DESCENDANT_TYPE_ORDER } from '../types';
import { StatusBadge, TypeBadge } from './Badges';

interface Props {
  assetId: string | undefined;
  onSelect: (id: string) => void;
}

// AssetDetails shows the selected asset, its descendant counts and its
// immediate children grouped by type. It fetches its own data from assetId so
// deep links and refreshes work without any parent coordination.
export function AssetDetails({ assetId, onSelect }: Props) {
  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [children, setChildren] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assetId) {
      setDetail(null);
      setChildren([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([api.getAsset(assetId), api.children(assetId)])
      .then(([d, c]) => {
        if (cancelled) return;
        setDetail(d);
        setChildren(c);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Failed to load asset');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assetId]);

  if (!assetId) {
    return (
      <div className="details empty-state">
        <h2>Select an asset</h2>
        <p>Choose an asset from the tree or search to see its details, children and descendant counts.</p>
      </div>
    );
  }
  if (loading) {
    return <div className="details state">Loading asset…</div>;
  }
  if (error) {
    return (
      <div className="details state error">
        <p>{error}</p>
      </div>
    );
  }
  if (!detail) {
    return <div className="details state">Asset not found.</div>;
  }

  const groups = DESCENDANT_TYPE_ORDER.map((type) => ({
    type,
    items: children.filter((c) => c.asset_type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="details">
      <div className="details-header">
        <div>
          <div className="details-title-row">
            <TypeBadge type={detail.asset_type} />
            <StatusBadge status={detail.operational_status} />
          </div>
          <h2>{detail.asset_name}</h2>
          <div className="details-id">{detail.asset_id}</div>
        </div>
      </div>

      <section className="field-grid">
        <Field label="Asset ID" value={detail.asset_id} />
        <Field label="Parent" value={detail.parent_asset_id ?? '— (root)'} onClick={detail.parent_asset_id ? () => onSelect(detail.parent_asset_id!) : undefined} />
        <Field label="Voltage (kV)" value={fmtNum(detail.voltage_kv)} />
        <Field label="Rating (kVA)" value={fmtNum(detail.rating_kva)} />
        <Field label="Manufacturer" value={detail.manufacturer ?? '—'} />
        <Field label="Model" value={detail.model ?? '—'} />
        <Field label="Serial number" value={detail.serial_number ?? '—'} />
        <Field label="Commissioned" value={fmtDate(detail.commissioned_date)} />
      </section>

      <section className="counts">
        <h3>Descendants ({detail.total_descendants})</h3>
        <div className="count-row">
          {DESCENDANT_TYPE_ORDER.map((type) => (
            <div className="count-pill" key={type}>
              <span className="count-value">{detail.descendant_counts[type] ?? 0}</span>
              <span className="count-label">{ASSET_TYPE_LABELS[type]}s</span>
            </div>
          ))}
        </div>
      </section>

      <section className="children">
        <h3>Immediate children ({children.length})</h3>
        {groups.length === 0 ? (
          <p className="muted">This asset has no children.</p>
        ) : (
          groups.map((group) => (
            <div className="child-group" key={group.type}>
              <h4>
                {ASSET_TYPE_LABELS[group.type]}s <span className="muted">({group.items.length})</span>
              </h4>
              <ul className="child-list">
                {group.items.map((c) => (
                  <li key={c.asset_id}>
                    <button className="child-link" onClick={() => onSelect(c.asset_id)}>
                      <span className="child-name">{c.asset_name}</span>
                      <span className="child-id">{c.asset_id}</span>
                      <StatusBadge status={c.operational_status} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      {onClick ? (
        <button className="field-value link" onClick={onClick}>
          {value}
        </button>
      ) : (
        <div className="field-value">{value}</div>
      )}
    </div>
  );
}

function fmtNum(n: number | null): string {
  return n === null || n === undefined ? '—' : String(n);
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  // Backend returns RFC3339; show just the date part.
  return d.slice(0, 10);
}
