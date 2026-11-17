import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from './api';

// Builds a fake fetch Response.
function fakeResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('api client', () => {
  it('roots() unwraps the assets array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse({ assets: [{ asset_id: 'SS-001' }] })));
    const roots = await api.roots();
    expect(roots).toHaveLength(1);
    expect(roots[0].asset_id).toBe('SS-001');
  });

  it('hits the correct /api URL for a nested resource', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse({ assets: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await api.ancestors('PNL-001');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/assets/PNL-001/ancestors');
  });

  it('throws ApiError carrying the backend message and status on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse({ error: 'asset not found' }, { ok: false, status: 404 })));
    try {
      await api.getAsset('nope');
      expect.unreachable('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(404);
      expect((e as ApiError).message).toBe('asset not found');
    }
  });

  it('surfaces a friendly error when the network is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api.roots()).rejects.toMatchObject({ status: 0 });
  });

  it('importCsv POSTs the file as multipart FormData to /api/imports', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      fakeResponse({ total_rows: 0, imported: 0, rejected: 0, committed: false, rejections: [] }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['asset_id\nSS-1\n'], 'grid.csv', { type: 'text/csv' });

    await api.importCsv(file);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/imports');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('file')).toBe(file);
  });

  it('builds the search query string from q and type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse({ assets: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await api.search('panel', 'SWITCHBOARD_PANEL');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/assets/search?q=panel&type=SWITCHBOARD_PANEL');
  });
});
