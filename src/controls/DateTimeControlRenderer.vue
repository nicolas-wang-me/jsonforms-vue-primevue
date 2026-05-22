<template>
  <Fluid>
    <control-wrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="isFocused"
      :appliedOptions="appliedOptions"
    >
      <div :class="styles.control.root + '-inner'">
        <label v-if="computedLabel" :for="control.id + '-input'" class="primevue-control-label">
          {{ computedLabel }}
          <span v-if="control.required" class="primevue-control-required">*</span>
        </label>
        <DatePicker
          v-disabled-icon-focus
          :id="control.id + '-input'"
          :class="[styles.control.input, { 'p-invalid': control.errors }]"
          :disabled="!control.enabled"
          :placeholder="appliedOptions.placeholder ?? dateTimeFormat"
          :show-time="showTime"
          :time-only="timeOnly"
          :model-value="pickerValue"
          :date-format="dateFormat"
          :hour-format="hourFormat"
          v-bind="primeVueProps('DatePicker')"
          @update:model-value="onPickerChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <small v-if="control.errors" class="primevue-control-error">{{ control.errors }}</small>
        <small v-else-if="control.description && persistentHint()" class="primevue-control-hint">{{ control.description }}</small>
      </div>
    </control-wrapper>
  </Fluid>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsControl,
  type RendererProps,
} from '@jsonforms/vue';
import { defineComponent } from 'vue';
import DatePicker from 'primevue/datepicker';
import Fluid from 'primevue/fluid';
import { usePrimeVueControl, determineClearValue, parseDateTime } from '../util';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { DisabledIconFocus } from './directives';
import dayjs from 'dayjs';

const controlRenderer = defineComponent({
  name: 'datetime-control-renderer',
  components: {
    ControlWrapper,
    DatePicker,
    Fluid,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const clearValue = determineClearValue('');
    return usePrimeVueControl(
     useJsonFormsControl(props),
     (value) => value || clearValue,
     300,
    );
  },
  computed: {
    showTime(): boolean {
     const format = this.appliedOptions.dateTimeFormat;
     return format ? /[HhmsaA]/.test(format) : false;
    },
    timeOnly(): boolean {
     const format = this.appliedOptions.dateTimeFormat;
     return format ? !/[Dd]/.test(format) : false;
    },
    dateTimeFormat(): string {
     return this.appliedOptions.dateTimeFormat || 'mm/dd/yy';
    },
    dateTimeSaveFormat(): string {
     return typeof this.appliedOptions.dateTimeSaveFormat == 'string'
       ? this.appliedOptions.dateTimeSaveFormat
       : 'YYYY-MM-DDTHH:mm:ss';
    },
    hourFormat(): string {
     return this.appliedOptions.ampm === true ? '12' : '24';
    },
    pickerValue(): Date | null {
     const value = this.control.data;
     if (!value) {
       return null;
     }
     const formats = [
       this.dateTimeSaveFormat,
       this.dateTimeFormat,
       'YYYY-MM-DDTHH:mm:ss',
       'YYYY-MM-DD HH:mm:ss',
     ];
     const date = parseDateTime(value, formats);
     return date ? date.toDate() : null;
    },
    dateFormat(): string {
     const format = this.appliedOptions.dateTimeFormat;
     if (!format) {
       return 'mm/dd/yy';
     }
     // Extract only the date portion (before time tokens)
     const datePortion = this.extractDatePortion(format);
     return this.convertToPrimeVueFormat(datePortion);
    },
  },
  methods: {
   onPickerChange(value: Date | Date[] | (Date | null)[] | null | undefined): void {
      // Convert Date object from DatePicker to ISO string format for validation
      if (value instanceof Date) {
        const formattedValue = dayjs(value).format(this.dateTimeSaveFormat);
        this.onChange(formattedValue);
      } else {
        this.onChange(value);
      }
    },
    /**
     * Extract the date portion from a dayjs datetime format string.
     * Time tokens (H, h, m, s, a, A, Z) and their adjacent separators
     * are removed, leaving only date-related tokens.
     */
    extractDatePortion(format: string): string {
     const timeTokens = [
       'HH',
       'hh',
       'H',
       'h',
       'mm',
       'm',
       'ss',
       's',
       'A',
       'a',
       'Z',
       'ZZ',
       'X',
       'x',
     ];
     let firstTimeIndex = -1;

     for (const token of timeTokens) {
       const index = format.indexOf(token);
       if (index !== -1 && (firstTimeIndex === -1 || index < firstTimeIndex)) {
         firstTimeIndex = index;
       }
     }

     if (firstTimeIndex !== -1) {
       let end = firstTimeIndex;
       while (end > 0 && /[\s\-.，T:]/.test(format[end - 1])) {
         end--;
       }
       return format.substring(0, end);
     }

     return format;
    },
    /**
     * Convert dayjs date format tokens to PrimeVue Calendar format tokens.
     * PrimeVue uses: yy=4-digit year, y=2-digit year, mm=month number,
     * MM=month name, dd=day, d=day no-pad
     */
    convertToPrimeVueFormat(dayjsFormat: string): string {
     return dayjsFormat
       .split('YYYY')
        .join('yy')
       .split('yyyy')
       .join('yy')
       .split('YY')
       .join('y')
       .split('MMMM')
       .join('MM')
       .split('MMM')
       .join('M')
       .split('DD')
       .join('dd')
       .split('D')
       .join('d')
       .split('MM')
       .join('mm');
    },
  },
});

export default controlRenderer;
</script>

<style scoped>
.control-inner {
  display: flex;
  flex-direction: column;
  gap: var(--p-spacing-1, 0.25rem);
}

.control-inner .p-datepicker {
  width: 100%;
}

.primevue-control-label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: var(--p-font-size-sm, 0.875rem);
  display: flex;
  align-items: center;
  gap: var(--p-spacing-1, 0.25rem);
}

.primevue-control-required {
  color: var(--p-error-color, #f87171);
  font-weight: 600;
}

.primevue-control-error {
  color: var(--p-error-color, #f87171);
  font-size: var(--p-font-size-sm, 0.875rem);
  display: block;
  margin-top: var(--p-spacing-1, 0.25rem);
}

.primevue-control-hint {
  color: var(--p-text-color-secondary, #6b7280);
  font-size: var(--p-font-size-sm, 0.875rem);
  display: block;
  margin-top: var(--p-spacing-1, 0.25rem);
}
</style>
