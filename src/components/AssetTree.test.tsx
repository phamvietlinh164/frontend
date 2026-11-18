import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AssetTree } from './AssetTree';
import type { AssetTreeState } from '../lib/useAssetTree';
import { makeAsset } from '../test/factories';

// Builds a fully-typed AssetTreeState with inert defaults; each test overrides
// only the slice it exercises. The hook itself is tested via its callers.
function makeTree(overrides: Partial<AssetTreeState> = {}): AssetTreeState {
  return {
    roots: [],
    childrenCache: {},
    expanded: new Set(),
    loadingIds: new Set(),
    rootsLoading: false,
    error: null,
    toggle: vi.fn(),
    loadChildren: vi.fn(),
    revealPath: vi.fn(),
    reload: vi.fn(),
    ...overrides,
  };
}

describe('AssetTree', () => {
  it('shows a loading state while roots are loading', () => {
    render(<AssetTree tree={makeTree({ rootsLoading: true })} selectedId={undefined} onSelect={vi.fn()} />);
    expect(screen.getByText(/loading hierarchy/i)).toBeInTheDocument();
  });

  it('shows the error and retries via reload', async () => {
    const reload = vi.fn();
    render(<AssetTree tree={makeTree({ error: 'Failed to load assets', reload })} selectedId={undefined} onSelect={vi.fn()} />);

    expect(screen.getByText('Failed to load assets')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state prompting an upload when there are no roots', () => {
    render(<AssetTree tree={makeTree({ roots: [] })} selectedId={undefined} onSelect={vi.fn()} />);
    expect(screen.getByText(/no assets yet/i)).toBeInTheDocument();
  });

  it('renders roots and selects an asset when its row is clicked', async () => {
    const onSelect = vi.fn();
    const tree = makeTree({
      roots: [makeAsset({ asset_id: 'SS-001', asset_type: 'SUBSTATION', asset_name: 'Aurora Substation' })],
    });
    render(<AssetTree tree={tree} selectedId={undefined} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('Aurora Substation'));
    expect(onSelect).toHaveBeenCalledWith('SS-001');
  });

  it('toggles an expandable node without selecting it (stopPropagation)', async () => {
    const toggle = vi.fn();
    const onSelect = vi.fn();
    const tree = makeTree({
      roots: [makeAsset({ asset_id: 'SS-001', asset_type: 'SUBSTATION', asset_name: 'Aurora Substation' })],
      toggle,
    });
    render(<AssetTree tree={tree} selectedId={undefined} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: /expand/i }));
    expect(toggle).toHaveBeenCalledWith('SS-001');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders cached children when a node is expanded', () => {
    const tree = makeTree({
      roots: [makeAsset({ asset_id: 'SS-001', asset_type: 'SUBSTATION', asset_name: 'Aurora Substation' })],
      expanded: new Set(['SS-001']),
      childrenCache: {
        'SS-001': [makeAsset({ asset_id: 'TX-1', asset_type: 'TRANSFORMER', asset_name: 'Main Transformer', parent_asset_id: 'SS-001' })],
      },
    });
    render(<AssetTree tree={tree} selectedId={undefined} onSelect={vi.fn()} />);

    expect(screen.getByText('Main Transformer')).toBeInTheDocument();
  });

  it('shows "No children" for an expanded node with an empty child list', () => {
    const tree = makeTree({
      roots: [makeAsset({ asset_id: 'SS-001', asset_type: 'SUBSTATION', asset_name: 'Aurora Substation' })],
      expanded: new Set(['SS-001']),
      childrenCache: { 'SS-001': [] },
    });
    render(<AssetTree tree={tree} selectedId={undefined} onSelect={vi.fn()} />);

    expect(screen.getByText(/no children/i)).toBeInTheDocument();
  });
});
