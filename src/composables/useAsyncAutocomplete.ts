import { ref, computed, watch } from 'vue';
import debounce from 'lodash/debounce';
import get from 'lodash/get';

export interface RemoteOptions {
  searchFn?: (q?: string) => Promise<any>;
  url?: string;
  queryParam?: string;
  responsePath?: string; // e.g. 'items' or 'data'
  labelField?: string;
  descriptionField?: string;
  valueField?: string;
  hitsToChoices?: (hits: any[]) => any[];
  extractValue?: (hit: any) => any;
  displayFn?: (hit: any) => string;
  template?: string | ((hit: any) => string);
  debounce?: number;
  minLength?: number;
}

const defaultQueryParam = 'q';

function defaultHitsToChoices(hits: any[], opts: RemoteOptions) {
  const labelField = opts.labelField ?? 'name';
  const descField = opts.descriptionField ?? 'message';
  const template = opts.template;

  return hits.map((hit) => {
    let label = '';
    if (typeof template === 'function') label = template(hit);
    else if (typeof template === 'string') {
      label = template.replace(/\{([^}]+)\}/g, (_, k) => get(hit, k, ''));
    } else if ((opts as any).displayFn) {
      // @ts-ignore
      label = (opts as any).displayFn(hit);
    } else {
      label = get(hit, labelField, '') || JSON.stringify(hit);
    }

    const value = (opts as any).extractValue ? (opts as any).extractValue(hit) : get(hit, opts.valueField ?? 'id', hit);

    return { label, value, meta: hit };
  });
}

export default function useAsyncAutocomplete(options: RemoteOptions) {
  const suggestions = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<any>(null);

  const minLength = options.minLength ?? 1;
  const debounceMs = options.debounce ?? 300;

  const fetchHits = async (q?: string) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      if (options.searchFn) {
        res = await options.searchFn(q);
      } else if (options.url) {
        const params = new URLSearchParams();
        params.set(options.queryParam ?? defaultQueryParam, q ?? '');
        const resp = await fetch(`${options.url}?${params.toString()}`);
        res = await resp.json();
      } else {
        res = [];
      }

      // extract array of hits
      let hits: any[] = [];
      if (Array.isArray(res)) hits = res;
      else if (options.responsePath) hits = get(res, options.responsePath, []);
      else if (Array.isArray(res.items)) hits = res.items;
      else if (Array.isArray(res.data)) hits = res.data;
      else if (Array.isArray(res.results)) hits = res.results;
      else hits = [];

      const mapped = options.hitsToChoices ? options.hitsToChoices(hits) : defaultHitsToChoices(hits, options);
      suggestions.value = mapped;
    } catch (e) {
      error.value = e;
      suggestions.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchByValue = async (value: any) => {
    // Try remoteGet fn, then try GET /url/{value}
    try {
      let res: any;
      if ((options as any).remoteGet && typeof (options as any).remoteGet === 'function') {
        res = await (options as any).remoteGet(value);
      } else if (options.url) {
        // attempt direct fetch by id
        const resp = await fetch(`${options.url.replace(/\/$/, '')}/${encodeURIComponent(String(value))}`);
        res = await resp.json();
      } else {
        return null;
      }

      // if response is an array, pick first
      const hit = Array.isArray(res) ? res[0] : res;
      if (!hit) return null;

      const mapped = options.hitsToChoices ? options.hitsToChoices([hit])[0] : defaultHitsToChoices([hit], options)[0];
      return mapped;
    } catch (e) {
      // swallow
      return null;
    }
  };


  const debouncedFetch = debounce(async (q?: string) => {
    if (!q || q.length < minLength) {
      // if empty and minLength > 0, clear suggestions
      if (!q) {
        await fetchHits(q);
      } else {
        suggestions.value = [];
      }
      return;
    }
    await fetchHits(q);
  }, debounceMs);

  const onComplete = (query?: string) => {
    // allow immediate empty queries when minLength == 0
    if ((query ?? '').length === 0 && (options.minLength ?? 1) === 0) {
      debouncedFetch('');
      return;
    }
    debouncedFetch(query);
  };

  // expose a way to format a selected value into a label if needed
  const formatLabelFor = (hit: any) => {
    if (!hit) return '';
    if ((options as any).displayFn) return (options as any).displayFn(hit);
    if (typeof options.template === 'function') return (options.template as any)(hit);
    if (typeof options.template === 'string') return (options.template as string).replace(/\{([^}]+)\}/g, (_, k) => get(hit, k, ''));
    if (options.labelField) return get(hit, options.labelField, '');
    return String(hit);
  };

  // initialize if needed
  if ((options.minLength ?? 1) === 0) {
    // fetch initial set
    debouncedFetch('');
  }

  return {
    suggestions: computed(() => suggestions.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    onComplete,
    formatLabelFor,
    fetchByValue,
  };
}

