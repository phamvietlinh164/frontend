import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBar } from './SearchBar';
import { api } from '../lib/api';
import { makeAsset } from '../test/factories';

// Mock the API module so the component is tested in isolation.
vi.mock('../lib/api', () => ({ api: { search: vi.fn() } }));
const mockedSearch = vi.mocked(api.search);

describe('SearchBar', () => {
  beforeEach(() => mockedSearch.mockReset());

  it('debounced-searches by text and calls onSelect with the chosen asset id', async () => {
    mockedSearch.mockResolvedValue([makeAsset({ asset_id: 'SS-001', asset_name: 'Aurora Substation' })]);
    const onSelect = vi.fn();
    render(<SearchBar onSelect={onSelect} />);

    await userEvent.type(screen.getByLabelText('Search assets'), 'aur');
    const result = await screen.findByText('Aurora Substation');
    await userEvent.click(result);

    expect(mockedSearch).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith('SS-001');
  });

  it('passes the selected type filter to the API (even with an empty query)', async () => {
    mockedSearch.mockResolvedValue([]);
    render(<SearchBar onSelect={() => {}} />);

    await userEvent.selectOptions(screen.getByLabelText('Filter by type'), 'SWITCHBOARD_PANEL');

    await waitFor(() => expect(mockedSearch).toHaveBeenCalledWith('', 'SWITCHBOARD_PANEL'));
  });
});
