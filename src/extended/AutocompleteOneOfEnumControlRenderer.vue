<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <Select
      v-if="appliedOptions.autocomplete === false"
      v-disabled-icon-focus
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :model-value="control.data"
      :options="control.options"
      option-label="label"
      option-value="value"
      :show-clear="control.enabled"
      v-bind="primeVueProps('Select')"
      @update:model-value="onChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <AutoComplete
      v-else
      v-disabled-icon-focus
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :model-value="control.data"
      :suggestions="filteredOptions"
      option-label="label"
      option-value="value"
      :dropdown="true"
      v-bind="primeVueProps('AutoComplete')"
      @update:model-value="onChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @complete="onAutocomplete"
    />
  </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsOneOfEnumControl,
  type RendererProps,
} from '@jsonforms/vue';
import { defineComponent, ref, computed } from 'vue';
import Select from 'primevue/select';
import AutoComplete from 'primevue/autocomplete';
import { default as ControlWrapper } from '../controls/ControlWrapper.vue';
import { DisabledIconFocus } from '../controls/directives';
import { determineClearValue, usePrimeVueControl } from '../util';

const controlRenderer = defineComponent({
  name: 'autocomplete-oneof-enum-control-renderer',
  components: {
    ControlWrapper,
    Select,
    AutoComplete,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const clearValue = determineClearValue('');
    const input = useJsonFormsOneOfEnumControl(props);
    const searchTerm = ref('');
    
    const filteredOptions = computed(() => {
      const options = input.control.value?.options || [];
      if (!searchTerm.value) {
        return options;
      }
      const term = searchTerm.value.toLowerCase();
      return options.filter((opt: any) =>
        opt.label.toLowerCase().includes(term)
      );
    });
    
    const onAutocomplete = (event: any) => {
      searchTerm.value = event.query;
    };
    
    return {
      ...usePrimeVueControl(
        input,
        (value) => (value === null ? clearValue : value),
        300,
      ),
      filteredOptions,
      onAutocomplete,
    };
  },
});

export default controlRenderer;
</script>
