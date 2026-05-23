Plan: Async searchable Select control for JSON Forms (PrimeVue)

Problem
- Provide an enhanced Select control for jsonforms-vue-primevue that queries a backend as the user types, shows hits as selectable choices, and stores a derived value from the chosen hit into JSON Forms state.

Backend (FastAPI / FastCRUD) specifics & defaults (user feedback)
- Backend: default generator is FastAPI/FastCRUD. Responses may be either a raw list of records or a paginated wrapper (e.g., { total: N, items: [...] } or { data: [...] }). Support both via configurable responsePath or a custom searchFn.
- Typical record example: { id: 0, name: '1st', message: 'the first one' }.
- Display options after choosing a hit:
  - Consumer can specify a single field key to display (e.g., labelField: "name") OR
  - Provide a function to map the record to the displayed string (e.g., hit => `${hit.name}: ${hit.message}`).
- Stored value options after selection:
  - Consumer may specify a valueField (e.g., "id") OR
  - Provide an extractValue function to map the record to any type (string, number, object).

High-level approach
- Reuse and extend existing Autocomplete renderers (src/extended/AutocompleteEnumControlRenderer.vue and AutocompleteOneOfEnumControlRenderer.vue).
- Extract common async logic into a composable (useAsyncAutocomplete) that handles: calling searchFn or fetch URL, following responsePath, debounce, minLength, loading/error state, optional caching, and mapping via hitsToChoices.
- Expose configuration via UI schema under options.remoteSelect (opt-in). Support both simple key-based options and function overrides:
  {
    "remoteSelect": {
      "url": "https://api/...",            // optional, used if searchFn not provided
      "queryParam": "q",                  // default q
      "responsePath": "items|data|",     // optional path to array inside response
      "labelField": "name",               // optional shorthand for hitsToChoices mapping
      "descriptionField": "message",     // optional to show secondary text
      "valueField": "id",                 // optional shorthand for extractValue
      "searchFn": (q)=>Promise,            // optional override
      "hitsToChoices": (hits)=>[],         // optional override
      "extractValue": (hit)=>hit.id,       // optional override
      "debounce": 300,
      "minLength": 2,
      "template": "{name}: {message}"     // optional template string for item display
    }
  }
- Provide sensible defaults so users can pass only url + valueField/labelField or rely on default assumptions (id,name,message). For more complex needs allow full function overrides.

Files to change / inspect
- src/extended/AutocompleteEnumControlRenderer.vue
- src/extended/AutocompleteOneOfEnumControlRenderer.vue
- src/extended/index.ts (registering new renderer if extracted)
- src/composables/useAsyncAutocomplete.ts (new composable)
- src/controls/ControlWrapper.vue (for uniform loading/error UI)
- README.md and example usage in docs block (include FastAPI examples)
- @example package: add a simulated async example demonstrating the full flow (query -> remote results -> mapping -> selection)

Implementation tasks (todos)
- implement-async-select: Create AsyncSelect renderer (single-select) + useAsyncAutocomplete composable; support UI schema remoteSelect options, responsePath, labelField/valueField shorthands and function overrides.
- defaults-and-composables: Implement default HTTP fetcher that understands typical FastAPI wrappers, defaultHitsToChoices (supports labelField/descriptionField/template) and defaultExtractValue (supports valueField or function).
- ui-schema-props: Document UI schema keys and examples in README and add example usage in dev app (show url+field keys, custom function use, and FastAPI wrapper handling).
- tests: Add unit tests for mapping functions and composable behavior; add integration tests mocking FastAPI-style responses.
- examples: Add an example page in the example/dev app demonstrating FastAPI default flow and a custom-function flow.
- example-simulated-async: Add a simulated async example inside @example package that uses an async function to mimic backend queries (use setTimeout/Promise) and demonstrates labelField/valueField and custom function overrides.

Important decisions & trade-offs
- PrimeVue component: AutoComplete remains recommended — supports templating and async queries.
- Storage: default stores id when valueField is provided; consumer can override to any type via extractValue.
- Flexibility: Support both simple key-based configs (for users of FastCRUD) and advanced function-based configs.

Developer notes
- Export helpers: defaultHitsToChoices(hits, {labelField, descriptionField, template}) and defaultExtractValue(hit, valueField) for consumers to reuse.
- README: include code snippets showing:
  - Minimal FastAPI use: { url: '...', labelField: 'name', valueField: 'id' }
  - Custom functions: { searchFn: async q => fetch(...), hitsToChoices: h=>..., extractValue: h=>... }
- @example: provide a ready-to-run simulated async example that developers can copy/paste when integrating with real backend.

