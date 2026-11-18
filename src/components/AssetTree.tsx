import type { Asset } from '../types';
import { EXPANDABLE_TYPES } from '../types';
import type { AssetTreeState } from '../lib/useAssetTree';
import { TypeBadge } from './Badges';

interface AssetTreeProps {
  tree: AssetTreeState;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

// AssetTree renders the root substations and delegates each to a TreeNode.
export function AssetTree({ tree, selectedId, onSelect }: AssetTreeProps) {
  if (tree.rootsLoading) {
    return <div className="tree-state">Loading hierarchy…</div>;
  }
  if (tree.error) {
    return (
      <div className="tree-state error">
        {tree.error}
        <button className="link-btn" onClick={tree.reload}>
          Retry
        </button>
      </div>
    );
  }
  if (tree.roots.length === 0) {
    return <div className="tree-state empty">No assets yet. Upload a CSV to get started.</div>;
  }
  return (
    <ul className="tree" role="tree">
      {tree.roots.map((root) => (
        <TreeNode key={root.asset_id} asset={root} depth={0} tree={tree} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </ul>
  );
}

interface TreeNodeProps {
  asset: Asset;
  depth: number;
  tree: AssetTreeState;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

function TreeNode({ asset, depth, tree, selectedId, onSelect }: TreeNodeProps) {
  const expandable = EXPANDABLE_TYPES.includes(asset.asset_type);
  const isExpanded = tree.expanded.has(asset.asset_id);
  const isLoading = tree.loadingIds.has(asset.asset_id);
  const children = tree.childrenCache[asset.asset_id];
  const isSelected = asset.asset_id === selectedId;

  return (
    <li role="treeitem" aria-expanded={expandable ? isExpanded : undefined} aria-selected={isSelected}>
      <div
        className={`tree-row${isSelected ? ' selected' : ''}`}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={() => onSelect(asset.asset_id)}
      >
        {expandable ? (
          <button
            className="twisty"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation();
              tree.toggle(asset.asset_id);
            }}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="twisty placeholder" />
        )}
        <TypeBadge type={asset.asset_type} />
        <span className="tree-name">{asset.asset_name}</span>
      </div>

      {expandable && isExpanded && (
        <ul className="tree" role="group">
          {isLoading && !children && <li className="tree-state small">Loading…</li>}
          {children && children.length === 0 && <li className="tree-state small empty">No children</li>}
          {children?.map((child) => (
            <TreeNode
              key={child.asset_id}
              asset={child}
              depth={depth + 1}
              tree={tree}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
