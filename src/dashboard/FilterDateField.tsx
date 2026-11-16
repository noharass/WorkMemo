import { useMemo } from "react";
import { DatePicker, Form } from "antd";
import dayjs from "dayjs";

const minDate = dayjs("1970-01-01");
const maxDate = dayjs("9999-12-31");

export function FilterDateField({ label, value, onChange, required = false, error }: {
  label: string; value: string | null; onChange: (value: string | null) => void;
  required?: boolean; error: string;
}) {
  // Picker resets its panel when the value reference changes. Polling must not
  // replace this object while the user is browsing a different month/year.
  const date = useMemo(() => value ? dayjs(value) : null, [value]);
  const id = `dc-filter-date-${required ? "anchor" : label === "开始日期" ? "start" : "end"}`;
  return <Form.Item label={label} htmlFor={id} validateStatus={error && !required ? "error" : undefined}>
    <DatePicker id={id} aria-required={required} aria-invalid={!!error && !required}
      aria-describedby={error && !required ? "dc-filter-error" : undefined}
      aria-label={label} value={date} minDate={minDate} maxDate={maxDate}
      allowClear={!required} format="YYYY-MM-DD" inputReadOnly={false}
      onChange={next => onChange(next?.format("YYYY-MM-DD") ?? null)} />
  </Form.Item>;
}
