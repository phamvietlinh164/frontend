import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Asset } from '../types';

export interface AssetTreeState {
  roots: Asset[];
  childrenCache: Record<string, Asset[]>;
  expanded: Set<string>;
  loadingIds: Set<string>;
  rootsLoading: boolean;
  error: string | null;
  toggle: (id: string) => void;
  loadChildren: (id: string) => Promise<Asset[]>;
  revealPath: (id: string) => Promise<void>;
  reload: () => void;
}

// useAssetTree owns the lazy-loaded hierarchy: the root substations, a cache of
// each node's children, and which nodes are expanded. It also knows how to
// expand the path to a given asset (used when arriving via search or a deep
// link) by fetching that asset's ancestors.
export function useAssetTree(): AssetTreeState {
  const [roots, setRoots] = useState<Asset[]>([]);
  const [childrenCache, setChildrenCache] = useState<Record<string, Asset[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [rootsLoading, setRootsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setRootsLoading(true);
    setError(null);
    api
      .roots()
      .then((r) => {
        if (!cancelled) setRoots(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Failed to load assets');
      })
      .finally(() => {
        if (!cancelled) setRootsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const loadChildren = useCallback(
    async (id: string): Promise<Asset[]> => {
      if (childrenCache[id]) return childrenCache[id];
      setLoadingIds((prev) => new Set(prev).add(id));
      try {
        const kids = await api.children(id);
        setChildrenCache((prev) => ({ ...prev, [id]: kids }));
        return kids;
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [childrenCache],
  );

  const toggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          void loadChildren(id);
        }
        return next;
      });
    },
    [loadChildren],
  );

  // revealPath loads and expands every ancestor so the target node is visible.
  const revealPath = useCallback(async (id: string) => {
    try {
      const ancestors = await api.ancestors(id); // root-first
      const toExpand = ancestors.map((a) => a.asset_id);
      // Load children along the path so the subtree is populated.
      for (const ancId of toExpand) {
        await loadChildrenInline(ancId);
      }
      setExpanded((prev) => {
        const next = new Set(prev);
        toExpand.forEach((a) => next.add(a));
        return next;
      });
    } catch (e) {
      // Revealing is best-effort; the details pane still shows the asset.
      console.warn('revealPath failed', e);
    }

    async function loadChildrenInline(ancId: string) {
      const kids = await api.children(ancId);
      setChildrenCache((prev) => (prev[ancId] ? prev : { ...prev, [ancId]: kids }));
    }
  }, []);

  const reload = useCallback(() => {
    setChildrenCache({});
    setExpanded(new Set());
    setReloadKey((k) => k + 1);
  }, []);

  return {
    roots,
    childrenCache,
    expanded,
    loadingIds,
    rootsLoading,
    error,
    toggle,
    loadChildren,
    revealPath,
    reload,
  };
}
