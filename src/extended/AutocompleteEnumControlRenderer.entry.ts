import {
  isEnumControl,
  rankWith,
  or,
  hasOption,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core';
import controlRenderer from './AutocompleteEnumControlRenderer.vue';

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(10, or(isEnumControl, hasOption('remoteSelect'))),
};
