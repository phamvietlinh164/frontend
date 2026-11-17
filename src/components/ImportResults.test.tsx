import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ImportResults } from './ImportResults';
import type { ImportResult } from '../types';

const partial: ImportResult = {
  total_rows: 3,
  imported: 2,
  rejected: 1,
  committed: true,
  rejections: [{ row: 5, asset_id: 'G-1', message: 'unsupported asset_type "GENERATOR"' }],
};

describe('ImportResults', () => {
  it('shows totals, the commit banner and every rejection row', () => {
    render(<ImportResults result={partial} onClose={() => {}} />);

    expect(screen.getByText('Import summary')).toBeInTheDocument();
    // Commit banner for a partial import that committed the accepted rows.
    expect(screen.getByText(/committed to the database/i)).toBeInTheDocument();
    // Rejection row details.
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('G-1')).toBeInTheDocument();
    expect(screen.getByText(/GENERATOR/)).toBeInTheDocument();
  });

  it('states clearly when nothing was committed', () => {
    const nothing: ImportResult = { total_rows: 1, imported: 0, rejected: 1, committed: false, rejections: [{ row: 2, message: 'asset_id is required' }] };
    render(<ImportResults result={nothing} onClose={() => {}} />);
    expect(screen.getByText(/no data was committed/i)).toBeInTheDocument();
  });

  it('calls onClose when the Done button is clicked', async () => {
    const onClose = vi.fn();
    render(<ImportResults result={partial} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
