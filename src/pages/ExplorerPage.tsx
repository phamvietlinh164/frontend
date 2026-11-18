import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AssetTree } from '../components/AssetTree';
import { AssetDetails } from '../components/AssetDetails';
import { SearchBar } from '../components/SearchBar';
import { UploadPanel } from '../components/UploadPanel';
import { ImportResults } from '../components/ImportResults';
import { useAssetTree } from '../lib/useAssetTree';
import type { ImportResult } from '../types';

// ExplorerPage ties the sidebar tree, search, upload and details pane together.
// The selected asset lives entirely in the URL (/assets/:assetId), so deep
// links and browser refresh restore the same view.
export function ExplorerPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const tree = useAssetTree();
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // When an asset is selected (via URL), expand the tree to reveal it.
  useEffect(() => {
    if (assetId && !tree.rootsLoading) {
      void tree.revealPath(assetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, tree.rootsLoading, tree.revealPath]);

  function select(id: string) {
    navigate(`/assets/${encodeURIComponent(id)}`);
  }

  function handleImported(result: ImportResult) {
    setImportResult(result);
    if (result.committed) {
      // Refresh the hierarchy to show the newly imported assets.
      tree.reload();
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">⚡</span>
          <div>
            <h1>Grid Asset Explorer</h1>
            <p className="tagline">Substations &amp; installed equipment</p>
          </div>
        </div>
        <SearchBar onSelect={select} />
        <UploadPanel onImported={handleImported} />
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Hierarchy</h2>
            <button className="link-btn" onClick={tree.reload} title="Reload">
              ⟳
            </button>
          </div>
          <AssetTree tree={tree} selectedId={assetId} onSelect={select} />
        </aside>

        <section className="content">
          <AssetDetails assetId={assetId} onSelect={select} />
        </section>
      </main>

      {importResult && <ImportResults result={importResult} onClose={() => setImportResult(null)} />}
    </div>
  );
}
