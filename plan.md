Plan: Async searchable Select control for JSON Forms (PrimeVue)

Summary (what was implemented and what remains)
- Implemented a reusable async Autocomplete flow and example usage. Key features now available:
  - useAsyncAutocomplete composable: searchFn/url support, responsePath, debounce, minLength, loading/error, hitsToChoices mapping, extractValue, format/display helpers, and fetchByValue (remoteGet) to resolve labels for existing stored values.
  - Autocomplete renderers updated to honor uischema.options.remoteSelect and to fetch/display labels for initial values.
  - showDropdown option: when true the AutoComplete dropdown icon is visible and clicking it sends an empty query to fetch initial choices.
  - createFastCrudRemote helper: generates searchFn and remoteGet for FastCRUD/FastAPI endpoints given base URL and field names.
- Remaining: add unit/integration tests, expand README docs with FastCRUD snippets, and add a dedicated example demonstrating remoteGet with a real HTTP backend.

Backend (FastAPI / FastCRUD) specifics & defaults
- Support raw arrays or wrapper responses (items/data/total) via responsePath or custom searchFn. Typical record: { id: 0, name: '1st', message: 'the first one' }.
- Default mappings: labelField (default 'name'), descriptionField (default 'message'), valueField (default 'id'). Use hitsToChoices/extractValue for custom shapes.
- Added remoteGet support: remoteSelect.remoteGet(value) || GET {baseUrl}/{value} used to fetch a single hit so the Autocomplete can display its label when JSON Forms already contains a stored value.

UI schema: options.remoteSelect (supported keys)
- url: string (optional fallback if searchFn not provided)
- queryParam / searchField: string (defaults to 'q')
- responsePath: string ('items'|'data'...) to extract list from wrapper
- labelField / descriptionField / valueField
- searchFn(q): Promise (override)
- remoteGet(value): Promise (resolve single hit; override)
- hitsToChoices(hits): map hits -> {label,value,meta}
- extractValue(hit): maps hit -> stored value
- template or displayFn for label formatting
- debounce, minLength
- showDropdown: boolean — show dropdown icon and send empty query when clicked

Files added/modified (implemented)
- src/composables/useAsyncAutocomplete.ts (new)
- src/extended/AutocompleteEnumControlRenderer.vue (updated)
- src/extended/AutocompleteOneOfEnumControlRenderer.vue (updated)
- src/extended/*entry.ts testers updated to match hasOption('remoteSelect')
- src/util/fastcrud.ts createFastCrudRemote helper
- dev/examples/schemas.js combined remoteSelect examples with Labels/descriptions

Example usage (uischema snippet)
{
  "type": "Control",
  "scope": "#/properties/productId",
  "options": {
    "remoteSelect": {
      "url": "https://api.example.com/products",
      "searchField": "name",
      "labelField": "name",
      "valueField": "id",
      "showDropdown": true
    }
  }
}

FastCRUD helper
- createFastCrudRemote({ baseUrl, searchField, labelField, valueField, responsePath }) returns { searchFn, remoteGet, labelField, valueField, responsePath } ready to plug into remoteSelect options.

Developer tasks / next steps
- Docs: update README with full examples (FastCRUD, remoteGet, hitsToChoices, extractValue, showDropdown). Add a short how-to for remoteGet to resolve initial values.
- Tests: unit tests for defaultHitsToChoices, extractValue, fetchByValue, and composable behavior (mock HTTP responses). Integration test for example UI.
- UX: consider showing spinner/placeholder when remoteGet fails and add configurable error text in appliedOptions.

Verification
- Type-check passed. To exercise manually: npm install && npm run dev — open the example app and use "Async Remote Select (combined)". Click the dropdown (if showDropdown:true) to fetch initial choices, and prefill the data with a known value to test remoteGet resolving label.

Notes
- API is opt-in via uischema.options.remoteSelect; non-remote enum behavior is unchanged.
- All features support both function-based overrides (searchFn, hitsToChoices, extractValue, remoteGet) and key-based simple configs (url, labelField, valueField).
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
