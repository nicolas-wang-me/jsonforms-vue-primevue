import {
  isOneOfEnumControl,
  rankWith,
  or,
  hasOption,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';
import controlRenderer from './AutocompleteOneOfEnumControlRenderer.vue';

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(10, or(isOneOfEnumControl, hasOption('remoteSelect'))),
};
