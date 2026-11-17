import type { Asset, AssetDetail } from '../types';

// Test factories: build fully-typed fixtures with sensible defaults so each test
// only overrides the fields it cares about.

export function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    asset_id: 'SS-001',
    parent_asset_id: null,
    asset_type: 'SUBSTATION',
    asset_name: 'Aurora Substation',
    operational_status: 'IN_SERVICE',
    voltage_kv: 22,
    rating_kva: null,
    manufacturer: null,
    model: null,
    serial_number: null,
    commissioned_date: null,
    ...overrides,
  };
}

export function makeDetail(overrides: Partial<AssetDetail> = {}): AssetDetail {
  return {
    ...makeAsset(),
    descendant_counts: {},
    total_descendants: 0,
    ...overrides,
  };
}
