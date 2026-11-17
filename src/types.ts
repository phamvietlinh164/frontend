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

// Only these types can have children in the permitted hierarchy, so the tree
// only shows an expander for them.
export const EXPANDABLE_TYPES: AssetType[] = ['SUBSTATION', 'SWITCHBOARD'];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  SUBSTATION: 'Substation',
  TRANSFORMER: 'Transformer',
  LV_BOARD: 'LV Board',
  SWITCHBOARD: 'Switchboard',
  SWITCHBOARD_PANEL: 'Panel',
};
