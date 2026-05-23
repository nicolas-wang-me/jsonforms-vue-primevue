export interface FastCrudRemoteOptions {
  baseUrl: string; // e.g. 'https://api.example.com/items' (no trailing slash optional)
  searchField?: string; // field name to search on, e.g. 'name' or 'q'
  labelField?: string; // field to use as label
  valueField?: string; // field to use as value (id)
  responsePath?: string; // optional path inside wrapper, e.g. 'items' or 'data'
}

// Creates a remoteSelect config with searchFn and remoteGet suitable for use with useAsyncAutocomplete
export function createFastCrudRemote(opts: FastCrudRemoteOptions) {
  const base = opts.baseUrl.replace(/\/$/, '');
  const searchField = opts.searchField ?? 'q';
  const labelField = opts.labelField ?? 'name';
  const valueField = opts.valueField ?? 'id';
  const responsePath = opts.responsePath;

  const searchFn = async (q?: string) => {
    const params = new URLSearchParams();
    if (q !== undefined && q !== null) params.set(searchField, String(q));
    // FastCRUD often supports pagination params; keep minimal
    const resp = await fetch(`${base}?${params.toString()}`);
    return resp.json();
  };

  const remoteGet = async (value: any) => {
    // attempt to GET resource by id
    const resp = await fetch(`${base}/${encodeURIComponent(String(value))}`);
    return resp.json();
  };

  return {
    searchFn,
    remoteGet,
    labelField,
    valueField,
    responsePath,
  };
}
