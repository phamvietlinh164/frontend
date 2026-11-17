import type { AssetType, OperationalStatus } from '../types';
import { ASSET_TYPE_LABELS } from '../types';

export function TypeBadge({ type }: { type: AssetType }) {
  return (
    <span className={`badge type type-${type}`} title={type}>
      {ASSET_TYPE_LABELS[type]}
    </span>
  );
}

export function StatusBadge({ status }: { status: OperationalStatus | null }) {
  if (!status) return <span className="badge status status-unknown">Unknown</span>;
  const label = status.replace(/_/g, ' ').toLowerCase();
  return (
    <span className={`badge status status-${status}`}>
      <span className="dot" /> {label}
    </span>
  );
}
