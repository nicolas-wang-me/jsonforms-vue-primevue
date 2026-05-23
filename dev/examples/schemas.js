/**
 * Custom Example Schemas for JSON Forms
 *
 * This file contains example schemas, UI schemas, and data for testing
 * and development purposes. Each example demonstrates specific features.
 */

/**
 * Example: Person Form
 *
 * Shows:
 * - HorizontalLayout with multiple fields in a row
 * - VerticalLayout for stacked fields
 * - Group (Fieldset) with legend
 * - ArrayLayout with items
 * - String, Number, Boolean, Enum, Date controls
 * - Required field validation
 */
export const personSchema = {
  type: 'object',
  required: ['firstName', 'lastName', 'birthDate'],
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      minLength: 2,
    },
    lastName: {
      type: 'string',
      title: 'Last Name',
      minLength: 2,
    },
    age: {
      type: 'integer',
      title: 'Age',
      minimum: 0,
      maximum: 150,
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email',
    },
    birthDate: {
      type: 'string',
      format: 'date',
      title: 'Birth Date',
    },
    nationality: {
      type: 'string',
      enum: ['US', 'UK', 'DE', 'FR', 'JP', 'Other'],
      title: 'Nationality',
    },
    vegetarian: {
      type: 'boolean',
      title: 'Vegetarian',
    },
    hobbies: {
      type: 'array',
      title: 'Hobbies',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Name',
          },
          skillLevel: {
            type: 'string',
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            title: 'Skill Level',
          },
        },
      },
    },
  },
};

export const personUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/firstName',
        },
        {
          type: 'Control',
          scope: '#/properties/lastName',
        },
      ],
    },
    {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/age',
        },
        {
          type: 'Control',
          scope: '#/properties/birthDate',
        },
      ],
    },
    {
      type: 'Control',
      scope: '#/properties/email',
    },
    {
      type: 'Group',
      label: 'Preferences',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/nationality',
        },
        {
          type: 'Control',
          scope: '#/properties/vegetarian',
        },
      ],
    },
    {
      type: 'Control',
      scope: '#/properties/hobbies',
      options: {
        detail: {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/name',
            },
            {
              type: 'Control',
              scope: '#/properties/skillLevel',
            },
          ],
        },
      },
    },
  ],
};

export const personData = {
  firstName: 'Jane',
  lastName: 'Doe',
  age: 28,
  email: 'jane.doe@example.com',
  birthDate: '1996-05-20',
  nationality: 'US',
  vegetarian: true,
  hobbies: [
    { name: 'Reading', skillLevel: 'Expert' },
    { name: 'Hiking', skillLevel: 'Intermediate' },
  ],
};

/**
 * Example: Tags Schema with Chips Control
 *
 * Shows:
 * - Array of strings rendered as editable Chips
 * - Comma and Enter key to add tags
 * - Backspace to remove tags
 * - Whitespace trimming
 */
export const tagsSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      title: 'Title',
      description: 'A title for your collection',
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
      title: 'Tags',
      description: 'Add tags separated by comma or press Enter',
    },
    keywords: {
      type: 'array',
      items: {
        type: 'string',
      },
      title: 'Keywords',
      minItems: 1,
      maxItems: 5,
      description: 'Add up to 5 keywords',
    },
  },
};

export const tagsUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/title',
    },
    {
      type: 'Control',
      scope: '#/properties/tags',
    },
    {
      type: 'Control',
      scope: '#/properties/keywords',
      options: { chips: true },
    },
  ],
};

export const tagsData = {
  title: 'My Awesome Project',
  tags: ['vue', 'forms', 'primevue'],
  keywords: ['json-schema', 'ui-generation'],
};

/**
 * Export all examples as an array
 * Each example must have:
 * - name: identifier for lookups (used by .find())
 * - label: display name in the UI
 * - schema: JSON Schema
 * - uischema: UI Schema
 * - data: Initial data (optional)
 */

// Example: Remote Async Select (simulated)
export const remoteSelectSchema = {
  type: 'object',
  properties: {
    productId: {
      type: ['integer', 'null'],
      title: 'Product (async select)',
    },
  },
};

// 1) Default: template string using placeholders
export const remoteSelectUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/productId',
      options: {
        remoteSelect: {
          searchFn: async (q) => {
            const hits = [
              { id: 1, name: 'Alpha', message: 'First item' },
              { id: 2, name: 'Beta', message: 'Second item' },
              { id: 3, name: 'Gamma', message: 'Third item' },
              { id: 4, name: 'Delta', message: 'Fourth item' },
            ];
            const lower = (q || '').toLowerCase();
            return new Promise((resolve) =>
              setTimeout(() => {
                if (!lower) return resolve(hits.slice(0, 5));
                resolve(
                  hits.filter(
                    (h) =>
                      String(h.name).toLowerCase().includes(lower) ||
                      String(h.message).toLowerCase().includes(lower)
                  )
                );
              }, 350)
            );
          },
          labelField: 'name',
          descriptionField: 'message',
          valueField: 'id',
          debounce: 300,
          minLength: 1,
          template: '{name}: {message}',
        },
      },
    },
  ],
};

// 2) Template as function (custom rendering for suggestions)
export const remoteSelectTemplateFunctionUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/productId',
      options: {
        remoteSelect: {
          // same simulated searchFn as above
          searchFn: async (q) => {
            const hits = [
              { id: 1, name: 'Alpha', message: 'First item' },
              { id: 2, name: 'Beta', message: 'Second item' },
              { id: 3, name: 'Gamma', message: 'Third item' },
              { id: 4, name: 'Delta', message: 'Fourth item' },
            ];
            const lower = (q || '').toLowerCase();
            return new Promise((resolve) =>
              setTimeout(() => {
                if (!lower) return resolve(hits.slice(0, 5));
                resolve(
                  hits.filter(
                    (h) =>
                      String(h.name).toLowerCase().includes(lower) ||
                      String(h.message).toLowerCase().includes(lower)
                  )
                );
              }, 350)
            );
          },
          // function template returns the suggestion string
          template: (hit) => `${hit.name} — ${hit.message}`,
          labelField: 'name',
          valueField: 'id',
          debounce: 200,
        },
      },
    },
  ],
};

// 3) Custom extractValue function (store composite value)
export const remoteSelectCustomExtractUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/productId',
      options: {
        remoteSelect: {
          searchFn: async (q) => {
            const hits = [
              { id: 1, name: 'Alpha', message: 'First item' },
              { id: 2, name: 'Beta', message: 'Second item' },
              { id: 3, name: 'Gamma', message: 'Third item' },
            ];
            const lower = (q || '').toLowerCase();
            return new Promise((resolve) =>
              setTimeout(() => {
                if (!lower) return resolve(hits);
                resolve(hits.filter((h) => String(h.name).toLowerCase().includes(lower)));
              }, 250)
            );
          },
          // label shown after selection (UI shows labelField)
          labelField: 'name',
          // store a composite object instead of primitive id
          extractValue: (hit) => ({ productId: hit.id, productName: hit.name }),
          template: '{name} — {message}',
        },
      },
    },
  ],
};

// 4) hitsToChoices function to shape suggestion items (complex labels/meta)
export const remoteSelectHitsToChoicesUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/productId',
      options: {
        remoteSelect: {
          searchFn: async (q) => {
            const hits = [
              { id: 10, sku: 'A-10', name: 'Alpha', message: 'First item' },
              { id: 20, sku: 'B-20', name: 'Beta', message: 'Second item' },
              { id: 30, sku: 'C-30', name: 'Gamma', message: 'Third item' },
            ];
            const lower = (q || '').toLowerCase();
            return new Promise((resolve) =>
              setTimeout(() => {
                resolve(
                  hits.filter(
                    (h) =>
                      h.name.toLowerCase().includes(lower) ||
                      h.sku.toLowerCase().includes(lower)
                  )
                );
              }, 200)
            );
          },
          // convert raw hits into custom choice objects: label, value, meta
          hitsToChoices: (hits) =>
            hits.map((h) => ({
              label: `${h.name} (${h.sku}) — ${h.message}`,
              value: h.id,
              meta: { sku: h.sku, raw: h },
            })),
          // labelField still used for display after selection (if not using custom displayFn)
          labelField: 'name',
          valueField: 'id',
          debounce: 150,
        },
      },
    },
  ],
};

// 5) Display function: use a custom displayFn to show a different final label after selection
export const remoteSelectDisplayFnUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/productId',
      options: {
        remoteSelect: {
          searchFn: async (q) => {
            const hits = [
              { id: 101, sku: 'X-101', name: 'Xray', message: 'Special' },
              { id: 102, sku: 'Y-102', name: 'Yankee', message: 'Special 2' },
            ];
            const lower = (q || '').toLowerCase();
            return new Promise((resolve) =>
              setTimeout(() => resolve(hits.filter((h) => h.name.toLowerCase().includes(lower))), 120)
            );
          },
          // template for suggestions
          template: (hit) => `${hit.name} — ${hit.sku} (${hit.message})`,
          // after selection, use displayFn to show final label in input instead of labelField
          displayFn: (hit) => `${hit.name} (${hit.sku})`,
          valueField: 'id',
        },
      },
    },
  ],
};

// 6) Nested value extraction: extract nested id from meta
export const remoteSelectNestedValueUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/productId',
      options: {
        remoteSelect: {
          searchFn: async (q) => {
            const hits = [
              { meta: { externalId: 'ext-1' }, name: 'ExtOne' },
              { meta: { externalId: 'ext-2' }, name: 'ExtTwo' },
            ];
            const lower = (q || '').toLowerCase();
            return new Promise((resolve) =>
              setTimeout(() => resolve(hits.filter((h) => h.name.toLowerCase().includes(lower))), 180)
            );
          },
          labelField: 'name',
          // nested extractValue
          extractValue: (hit) => hit.meta && hit.meta.externalId,
          template: '{name} ({meta.externalId})',
        },
      },
    },
  ],
};

// 7) Paginated response example: searchFn returns a wrapper { total, items }
export const remoteSelectPaginatedUischema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Control',
      scope: '#/properties/productId',
      options: {
        remoteSelect: {
          searchFn: async (q) => {
            const all = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `P-${i + 1}`, message: `Item ${i + 1}` }));
            const lower = (q || '').toLowerCase();
            const filtered = all.filter((h) => h.name.toLowerCase().includes(lower));
            // simulate server-side pagination wrapper
            return new Promise((resolve) =>
              setTimeout(() => resolve({ total: filtered.length, items: filtered.slice(0, 10) }), 220)
            );
          },
          // inform composable to extract items at responsePath
          responsePath: 'items',
          labelField: 'name',
          valueField: 'id',
          template: '{name}: {message}',
        },
      },
    },
  ],
};

export const remoteSelectData = {
  productId: null,
};

export const customExamples = {
  person: {
    name: 'person',
    label: 'Person',
    schema: personSchema,
    uischema: personUischema,
    data: personData,
  },
  tags: {
    name: 'tags',
    label: 'Tags',
    schema: tagsSchema,
    uischema: tagsUischema,
    data: tagsData,
  },
  remoteSelect: {
    name: 'remoteSelect',
    label: 'Async Remote Select (template string)',
    schema: remoteSelectSchema,
    uischema: remoteSelectUischema,
    data: remoteSelectData,
  },
  remoteSelectTemplateFunction: {
    name: 'remoteSelectTemplateFunction',
    label: 'Async Remote Select (template function)',
    schema: remoteSelectSchema,
    uischema: remoteSelectTemplateFunctionUischema,
    data: remoteSelectData,
  },
  remoteSelectCustomExtract: {
    name: 'remoteSelectCustomExtract',
    label: 'Async Remote Select (custom extract)',
    schema: remoteSelectSchema,
    uischema: remoteSelectCustomExtractUischema,
    data: remoteSelectData,
  },
  remoteSelectHitsToChoices: {
    name: 'remoteSelectHitsToChoices',
    label: 'Async Remote Select (hitsToChoices)',
    schema: remoteSelectSchema,
    uischema: remoteSelectHitsToChoicesUischema,
    data: remoteSelectData,
  },
  remoteSelectDisplayFn: {
    name: 'remoteSelectDisplayFn',
    label: 'Async Remote Select (displayFn)',
    schema: remoteSelectSchema,
    uischema: remoteSelectDisplayFnUischema,
    data: remoteSelectData,
  },
  remoteSelectNestedValue: {
    name: 'remoteSelectNestedValue',
    label: 'Async Remote Select (nested extract)',
    schema: remoteSelectSchema,
    uischema: remoteSelectNestedValueUischema,
    data: remoteSelectData,
  },
  remoteSelectPaginated: {
    name: 'remoteSelectPaginated',
    label: 'Async Remote Select (paginated response)',
    schema: remoteSelectSchema,
    uischema: remoteSelectPaginatedUischema,
    data: remoteSelectData,
  },
};
