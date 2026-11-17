import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetDetails } from './AssetDetails';
import { api } from '../lib/api';
import { makeAsset, makeDetail } from '../test/factories';

vi.mock('../lib/api', () => ({ api: { getAsset: vi.fn(), children: vi.fn() } }));
const mockedGet = vi.mocked(api.getAsset);
const mockedChildren = vi.mocked(api.children);

describe('AssetDetails', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedChildren.mockReset();
  });

  it('prompts to pick an asset when none is selected', () => {
    render(<AssetDetails assetId={undefined} onSelect={() => {}} />);
    expect(screen.getByText(/select an asset/i)).toBeInTheDocument();
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('renders details, descendant counts and children, and navigates on child click', async () => {
    mockedGet.mockResolvedValue(
      makeDetail({
        asset_id: 'SS-001',
        asset_name: 'Aurora Substation',
        descendant_counts: { TRANSFORMER: 2, SWITCHBOARD: 1 },
        total_descendants: 3,
      }),
    );
    mockedChildren.mockResolvedValue([
      makeAsset({ asset_id: 'TX-1', asset_name: 'Transformer T1', asset_type: 'TRANSFORMER', parent_asset_id: 'SS-001' }),
    ]);
    const onSelect = vi.fn();
    render(<AssetDetails assetId="SS-001" onSelect={onSelect} />);

    expect(await screen.findByRole('heading', { name: 'Aurora Substation' })).toBeInTheDocument();
    expect(screen.getByText('Descendants (3)')).toBeInTheDocument();

    await userEvent.click(await screen.findByText('Transformer T1'));
    expect(onSelect).toHaveBeenCalledWith('TX-1');
  });

  it('shows an error state when loading fails', async () => {
    mockedGet.mockRejectedValue(new Error('network down'));
    mockedChildren.mockRejectedValue(new Error('network down'));
    render(<AssetDetails assetId="SS-001" onSelect={() => {}} />);
    expect(await screen.findByText('network down')).toBeInTheDocument();
  });
});
