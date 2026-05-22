IMPROVE: DateTimeControlRenderer — UTC storage option

Summary
- Added uischema.options.utc (boolean, default: false) to DateTimeControlRenderer.vue. When enabled, the component preserves timezone information for storage (UTC) while always displaying dates/times in the user's local timezone.
- Added uischema.options.storageFormat (optional). When utc is true and storageFormat is missing or 'iso', Date.toISOString() is used for storage (ISO 8601 with Z). Custom storage formats are supported via dayjs UTC formatting but not recommended unless necessary.

What changed
- New onPickerChange method replaced direct @update:model-value="onChange" binding to apply conversions on save.
- pickerValue still uses parseDateTime(...) to parse incoming values; when utc is true, stored UTC values are parsed and converted to local Date objects for the PrimeVue Calendar.
- When saving:
  - utc: true + storageFormat omitted | 'iso' -> use date.toISOString() (UTC with 'Z')
  - utc: true + storageFormat provided -> dayjs.utc().format(storageFormat)
  - utc: false -> legacy formatting via dateTimeSaveFormat (unchanged)

Examples
- User enters local time "2026-05-22T09:00" (UTC+2):
  - With utc:true -> saved value = "2026-05-22T07:00:00.000Z" (Date.toISOString result)
  - On reload -> UI displays local time 09:00
- With utc:false -> saved format uses dateTimeSaveFormat (legacy behavior)

Implementation notes
- Reuses existing parseDateTime (dayjs) and dayjs utc plugin already configured in src/util/datejs.ts.
- No new dependencies added.
- Default behavior unchanged if utc is not set.

Files changed
- src/controls/DateTimeControlRenderer.vue (primary)

Tests and verification
- Ran existing test suite (npm test). All tests passed.

Commit
- feat: add uischema.options.utc and storageFormat handling to DateTimeControlRenderer.vue
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

Migration notes
- Consumers who previously relied on naive storage should set uischema.options.utc: true to preserve timezone information in stored values. If backend expects a specific serialized format other than ISO, set storageFormat accordingly; otherwise prefer default ISO (recommended).
