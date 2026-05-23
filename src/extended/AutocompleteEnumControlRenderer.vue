<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <Select
      v-if="appliedOptions.autocomplete === false"
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :readonly="control.readonly"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :required="control.required"
      :model-value="control.data"
      :options="enumOptions"
      optionLabel="label"
      optionValue="value"
      :filter="true"
      v-bind="primeVueProps('Select')"
      @update:model-value="onChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <AutoComplete
      v-else
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :readonly="control.readonly"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :required="control.required"
      :model-value="selectedLabel"
      :suggestions="filteredOptions"
      @complete="searchOptions"
      @update:model-value="onAutoCompleteChange"
      v-bind="primeVueProps('AutoComplete')"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement, type EnumOption } from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsEnumControl,
  type RendererProps,
} from '@jsonforms/vue';
import { computed, defineComponent, ref, watch } from 'vue';
import useAsyncAutocomplete from '../composables/useAsyncAutocomplete';
import Select from 'primevue/select';
import AutoComplete from 'primevue/autocomplete';
import { determineClearValue, usePrimeVueControl } from '../util';
import { default as ControlWrapper } from '../controls/ControlWrapper.vue';

interface Option {
  label: string;
  value: any;
}

const controlRenderer = defineComponent({
  name: 'autocomplete-enum-control-renderer',
  components: {
    ControlWrapper,
    Select,
    AutoComplete,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const clearValue = determineClearValue('');
    const control = usePrimeVueControl(
      useJsonFormsEnumControl(props),
      (value) => (value === null ? clearValue : value),
      300,
    );

    const enumOptions = computed<Option[]>(() => {
      const options = control.control.value.options as EnumOption[];
      return options
        ? options.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))
        : [];
    });

    const selectedLabel = ref('');
    const filteredOptions = ref<Option[]>([]);

    const remote = (control.appliedOptions as any).value?.remoteSelect;

    if (remote) {
      const { suggestions, onComplete, fetchByValue } = useAsyncAutocomplete(remote);
      watch(suggestions, (v) => {
        filteredOptions.value = v as any;
      }, { immediate: true });

      // if control already has a value, fetch its label and ensure it's present in suggestions so AutoComplete can display it
      watch(
        () => control.control.value.data,
        async (val) => {
          if (val === undefined || val === null) {
            selectedLabel.value = '';
            return;
          }
          const mapped = await fetchByValue(val);
          if (mapped) {
            // add if missing
            const exists = (filteredOptions.value || []).some((o: any) => o.value === mapped.value);
            if (!exists) filteredOptions.value = [mapped, ...(filteredOptions.value || [])];
            selectedLabel.value = mapped.label || String(val);
          }
        },
        { immediate: true },
      );

      const searchOptions = (event: any) => {
        onComplete(event.query);
      };

      const onAutoCompleteChange = (value: any) => {
        if (typeof value === 'string') {
          const found = (filteredOptions.value || []).find((opt: any) => opt.label === value);
          control.onChange(found ? found.value : null);
          selectedLabel.value = value;
        } else if (value && typeof value === 'object') {
          control.onChange(value.value ?? null);
          selectedLabel.value = value.label ?? '';
        } else {
          control.onChange(null);
          selectedLabel.value = '';
        }
      };

      return {
        ...control,
        enumOptions,
        selectedLabel,
        filteredOptions,
        searchOptions,
        onAutoCompleteChange,
      };
    }

    // fallback local enum behavior
    const selectedLabelComputed = computed(() => {
      const data = control.control.value.data;
      if (data === undefined || data === null) return '';
      const found = enumOptions.value.find((opt) => opt.value === data);
      return found ? found.label : '';
    });

    const searchOptions = (event: any) => {
      const query = event.query.toLowerCase();
      filteredOptions.value = enumOptions.value.filter((opt) =>
        opt.label.toLowerCase().includes(query),
      );
    };

    const onAutoCompleteChange = (value: any) => {
      if (typeof value === 'string') {
        // User typed something, find matching option
        const found = enumOptions.value.find((opt) => opt.label === value);
        control.onChange(found ? found.value : null);
      } else if (value && typeof value === 'object') {
        // User selected an option
        control.onChange(value.value);
      } else {
        control.onChange(null);
      }
    };

    return {
      ...control,
      enumOptions,
      selectedLabel: selectedLabelComputed,
      filteredOptions,
      searchOptions,
      onAutoCompleteChange,
    };
  },
});

export default controlRenderer;
</script>
