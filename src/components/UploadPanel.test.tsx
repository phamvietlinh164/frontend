import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadPanel } from './UploadPanel';
import { api } from '../lib/api';
import type { ImportResult } from '../types';

// Mock the API so the component is tested in isolation.
vi.mock('../lib/api', () => ({ api: { importCsv: vi.fn() } }));
const mockedImport = vi.mocked(api.importCsv);

function makeResult(overrides: Partial<ImportResult> = {}): ImportResult {
  return { total_rows: 1, imported: 1, rejected: 0, committed: true, rejections: [], ...overrides };
}

const csvFile = () =>
  new File(['asset_id,asset_type,asset_name\nSS-1,SUBSTATION,Sub'], 'grid_assets.csv', { type: 'text/csv' });

function fileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('file input not found');
  return input as HTMLInputElement;
}

describe('UploadPanel', () => {
  beforeEach(() => mockedImport.mockReset());

  it('shows the upload prompt in its idle state', () => {
    render(<UploadPanel onImported={vi.fn()} />);
    expect(screen.getByText(/upload csv/i)).toBeInTheDocument();
  });

  it('imports a chosen file and hands the result to the parent', async () => {
    mockedImport.mockResolvedValue(makeResult({ imported: 2, total_rows: 2 }));
    const onImported = vi.fn();
    const { container } = render(<UploadPanel onImported={onImported} />);

    await userEvent.upload(fileInput(container), csvFile());

    await waitFor(() => expect(onImported).toHaveBeenCalledWith(expect.objectContaining({ imported: 2 })));
    expect(mockedImport).toHaveBeenCalledTimes(1);
    expect(mockedImport.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it('surfaces the backend error and does not call onImported on failure', async () => {
    mockedImport.mockImplementationOnce(async () => {
      throw new Error('asset_type column is missing');
    });
    const onImported = vi.fn();
    const { container } = render(<UploadPanel onImported={onImported} />);

    await userEvent.upload(fileInput(container), csvFile());

    expect(await screen.findByText('asset_type column is missing')).toBeInTheDocument();
    expect(onImported).not.toHaveBeenCalled();
  });
});
