export type AssetType =
  | 'SUBSTATION'
  | 'TRANSFORMER'
  | 'LV_BOARD'
  | 'SWITCHBOARD'
  | 'SWITCHBOARD_PANEL';

export type OperationalStatus = 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface Asset {
  asset_id: string;
  parent_asset_id: string | null;
  asset_type: AssetType;
  asset_name: string;
  operational_status: OperationalStatus | null;
  voltage_kv: number | null;
  rating_kva: number | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  commissioned_date: string | null;
}

export interface AssetDetail extends Asset {
  descendant_counts: Partial<Record<AssetType, number>>;
  total_descendants: number;
}

export interface Rejection {
  row: number;
  asset_id?: string;
  message: string;
}

export interface ImportResult {
  total_rows: number;
  imported: number;
  rejected: number;
  committed: boolean;
  rejections: Rejection[];
}

// The permitted parent type for each asset type, mirroring the backend domain
// rules. Single source of truth for the hierarchy on the frontend: the constants
// below are derived from it so they can never drift apart.
export const PERMITTED_PARENT: Record<AssetType, AssetType | null> = {
  SUBSTATION: null,
  TRANSFORMER: 'SUBSTATION',
  LV_BOARD: 'SUBSTATION',
  SWITCHBOARD: 'SUBSTATION',
  SWITCHBOARD_PANEL: 'SWITCHBOARD',
};

// Types that can have children (i.e. appear as a permitted parent), derived from
// PERMITTED_PARENT so the tree only shows an expander where children are possible.
export const EXPANDABLE_TYPES: AssetType[] = Array.from(
  new Set(Object.values(PERMITTED_PARENT).filter((p): p is AssetType => p !== null)),
);

// Non-root asset types in display order, used both for grouping immediate
// children and for ordering the descendant-count pills.
export const DESCENDANT_TYPE_ORDER: AssetType[] = [
  'TRANSFORMER',
  'LV_BOARD',
  'SWITCHBOARD',
  'SWITCHBOARD_PANEL',
];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  SUBSTATION: 'Substation',
  TRANSFORMER: 'Transformer',
  LV_BOARD: 'LV Board',
  SWITCHBOARD: 'Switchboard',
  SWITCHBOARD_PANEL: 'Panel',
};
