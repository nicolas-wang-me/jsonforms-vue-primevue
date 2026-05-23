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
      type: 'integer',
      title: 'Product (async select)',
    },
  },
};

// Combined examples: each Control is a different configuration of the same productId field
export const remoteSelectCombinedUischema = {
  type: 'VerticalLayout',
  elements: [
    // Intro label
    {
      type: 'Label',
      text: 'Async Remote Select examples: each entry below demonstrates a different configuration. Try typing sample search characters shown before each example.'
    },

    // 1) Default: template string using placeholders
    {
      type: 'Label',
      text: '1) Template string — example searches: "Al", "First", "P-1"'
    },
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

    // 2) Template as function (custom rendering for suggestions)
    {
      type: 'Label',
      text: '2) Template function — example searches: "Be", "Second"'
    },
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
          template: (hit) => `${hit.name} — ${hit.message}`,
          labelField: 'name',
          valueField: 'id',
          debounce: 200,
        },
      },
    },

    // 3) Custom extractValue function (store composite value)
    {
      type: 'Label',
      text: '3) Custom extract — example searches: "Al", "Gamma" (stores composite object)'
    },
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
          labelField: 'name',
          extractValue: (hit) => ({ productId: hit.id, productName: hit.name }),
          template: '{name} — {message}',
        },
      },
    },

    // 4) hitsToChoices function to shape suggestion items (complex labels/meta)
    {
      type: 'Label',
      text: '4) hitsToChoices — example searches: "A-10", "B-20" (shows complex labels and meta)'
    },
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
          hitsToChoices: (hits) =>
            hits.map((h) => ({
              label: `${h.name} (${h.sku}) — ${h.message}`,
              value: h.id,
              meta: { sku: h.sku, raw: h },
            })),
          labelField: 'name',
          valueField: 'id',
          debounce: 150,
        },
      },
    },

    // 5) Display function: use a custom displayFn to show a different final label after selection
    {
      type: 'Label',
      text: '5) displayFn — example searches: "Xray", "Yankee" (custom final display)'
    },
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
            return new Promise((resolve) => resolve(hits.filter((h) => h.name.toLowerCase().includes(lower))), 120);
          },
          template: (hit) => `${hit.name} — ${hit.sku} (${hit.message})`,
          displayFn: (hit) => `${hit.name} (${hit.sku})`,
          valueField: 'id',
        },
      },
    },

    // 6) Nested value extraction: extract nested id from meta
    {
      type: 'Label',
      text: '6) Nested extract — example searches: "ExtOne", "ExtTwo" (stores nested externalId)'
    },
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
            return new Promise((resolve) => resolve(hits.filter((h) => h.name.toLowerCase().includes(lower))), 180);
          },
          labelField: 'name',
          extractValue: (hit) => hit.meta && hit.meta.externalId,
          template: '{name} ({meta.externalId})',
        },
      },
    },

    // 7) Paginated response example: searchFn returns a wrapper { total, items }
    {
      type: 'Label',
      text: '7) Paginated response — example searches: "P-1", "P-2" (server returns wrapper with items)'
    },
    {
      type: 'Control',
      scope: '#/properties/productId',
      options: {
        remoteSelect: {
          searchFn: async (q) => {
            const all = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `P-${i + 1}`, message: `Item ${i + 1}` }));
            const lower = (q || '').toLowerCase();
            const filtered = all.filter((h) => h.name.toLowerCase().includes(lower));
            return new Promise((resolve) => setTimeout(() => resolve({ total: filtered.length, items: filtered.slice(0, 10) }), 220));
          },
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
  remoteSelectCombined: {
    name: 'remoteSelectCombined',
    label: 'Async Remote Select (combined)',
    schema: remoteSelectSchema,
    uischema: remoteSelectCombinedUischema,
    data: remoteSelectData,
  },
};
