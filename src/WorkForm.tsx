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
  onCancel?: () => void;
  onStart: (input: StartInput) => Promise<boolean>;
}

export function WorkForm({
  minimal: _minimal = false,
  disabled,
  switching = false,
  starting = false,
  onStart,
  onCancel,
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

  function clearError(field: keyof StartInput) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const result = validateWorkInput(category, quantity, remark);
    if (!result.ok) {
      setErrors(result.errors);
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
      <div className="category-field">
        <span className="category-field-symbol" aria-hidden="true"><Icon name="list" /></span>
        <label>
          <span className="sr-only">工作类别</span>
          <select
            aria-label="工作类别"
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
            <option value="">选择工作类别</option>
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
      <div className="work-input-row">
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
          <span>备注（选填）</span>
          <textarea
            ref={remarkRef}
            rows={1}
            maxLength={4000}
            placeholder="添加备注（可选）"
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
      </div>
      {switching && <p className="switch-hint">开始后会保存上一项为待补全记录。</p>}
      <button type="submit" className="start-work" disabled={disabled}>
        <Icon name="play" />
        <span>{starting ? "正在开始…" : "开始工作"}</span>
      </button>
      {onCancel && <button type="button" className="cancel-switch" disabled={starting} onClick={onCancel}><Icon name="left" />取消切换</button>}
    </form>
  );
}
