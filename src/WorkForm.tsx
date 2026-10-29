import { useCategoryNames } from "./categoryNames";
import { useId, useRef, useState, type FormEvent } from "react";
import { CATEGORIES, type StartInput } from "./types";
import { validateWorkInput, type InputErrors } from "./workInput";
import { Icon } from "./Icon";

interface Props {
  disabled: boolean;
  minimal?: boolean;
  switching?: boolean;
  starting?: boolean;
  onStart: (input: StartInput) => Promise<boolean>;
}

export function WorkForm({
  minimal = false,
  disabled,
  switching = false,
  starting = false,
  onStart,
}: Props) {
  const { name } = useCategoryNames();
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState<InputErrors>({});
  const id = useId();
  const categoryRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const remarkRef = useRef<HTMLTextAreaElement>(null);
  const remarkDetails = useRef<HTMLDetailsElement>(null);

  function clearError(field: keyof StartInput) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const result = validateWorkInput(category, quantity, remark);
    if (!result.ok) {
      setErrors(result.errors);
      if (
        (result.errors.remark || result.errors.quantity) &&
        remarkDetails.current
      )
        remarkDetails.current.open = true;
      (result.errors.category
        ? categoryRef
        : result.errors.quantity
          ? quantityRef
          : remarkRef
      ).current?.focus();
      return;
    }
    setErrors({});
    await onStart(result.input);
  }

  return (
    <form
      className="work-form"
      aria-busy={starting}
      onSubmit={(event) => {
        void submit(event);
      }}
      noValidate
    >
      <div className={`field-row grid gap-3 grid-cols-1`}>
        <label>
          工作类别
          <select
            ref={categoryRef}
            value={category}
            disabled={disabled}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? `${id}-category` : undefined}
            onChange={(event) => {
              setCategory(event.target.value);
              clearError("category");
            }}
          >
            <option value="">请选择类别</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {name(value)}
              </option>
            ))}
          </select>
          {errors.category && (
            <span id={`${id}-category`} className="field-error" role="alert">
              {errors.category}
            </span>
          )}
        </label>
      </div>
      <details className="form-note" ref={remarkDetails} open={!minimal}>
        <summary>
          <Icon name="note" />
          工作量与备注 <span className="optional">选填</span>
        </summary>
        <label>
          工作量（可稍后填写）
          <input
            ref={quantityRef}
            type="number"
            inputMode="decimal"
            min="0"
            max="1000000000"
            step="any"
            placeholder="结束后填写；0 表示无产出"
            value={quantity}
            disabled={disabled}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? `${id}-quantity` : undefined}
            onChange={(event) => {
              setQuantity(event.target.value);
              clearError("quantity");
            }}
          />
          {errors.quantity && (
            <span id={`${id}-quantity`} className="field-error" role="alert">
              {errors.quantity}
            </span>
          )}
        </label>
        <label>
          <span className="sr-only">工作备注</span>
          <textarea
            ref={remarkRef}
            rows={1}
            maxLength={4000}
            placeholder="记下这次工作的内容…"
            value={remark}
            disabled={disabled}
            aria-invalid={Boolean(errors.remark)}
            aria-describedby={`${id}-remark-count${errors.remark ? ` ${id}-remark` : ""}`}
            onChange={(event) => {
              setRemark(event.target.value);
              clearError("remark");
            }}
          />
          <span id={`${id}-remark-count`} className="field-count">
            {Array.from(remark.trim()).length} / 2000
          </span>
          {errors.remark && (
            <span id={`${id}-remark`} className="field-error" role="alert">
              {errors.remark}
            </span>
          )}
        </label>
      </details>
      <p className="hint auxiliary">
        先记录时间，结束后在待补全列表确认工作量。
      </p>
      {switching && (
        <p className="hint">
          开始后将结束并保存当前已暂停的任务，工作量稍后结算。
        </p>
      )}
      <button type="submit" disabled={disabled}>
        {starting
          ? switching
            ? "正在保存并开始…"
            : "正在开始…"
          : switching
            ? "保存上一项，开始新工作"
            : "手动开始工作"}
        <Icon name="open" />
      </button>
    </form>
  );
}
