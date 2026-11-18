import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExplorerPage } from './pages/ExplorerPage';

// The same page renders for the root and for a selected asset; the asset id is
// a stable route param so refresh and direct navigation keep the selection.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExplorerPage />} />
        <Route path="/assets/:assetId" element={<ExplorerPage />} />
        <Route path="*" element={<ExplorerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
