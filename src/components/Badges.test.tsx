import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge, TypeBadge } from './Badges';

describe('TypeBadge', () => {
  it('renders the human label for an asset type', () => {
    render(<TypeBadge type="SWITCHBOARD_PANEL" />);
    expect(screen.getByText('Panel')).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('renders a readable status', () => {
    render(<StatusBadge status="IN_SERVICE" />);
    expect(screen.getByText(/in service/i)).toBeInTheDocument();
  });

  it('falls back to "Unknown" when the status is null', () => {
    render(<StatusBadge status={null} />);
    expect(screen.getByText(/unknown/i)).toBeInTheDocument();
  });
});
