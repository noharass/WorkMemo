import { useState, type FormEvent } from "react";
import { CATEGORIES, type StartInput } from "./types";

interface Props {
  disabled: boolean;
  switching?: boolean;
  onStart: (input: StartInput) => Promise<boolean>;
}

export function WorkForm({ disabled, switching = false, onStart }: Props) {
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    if (!CATEGORIES.some((value) => value === category)) { setError("请选择工作类别。"); return; }
    const amount = Number(quantity);
    if (!quantity.trim() || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
      setError("数量必须大于 0，且不超过 10 亿。"); return;
    }
    if (Array.from(remark.trim()).length > 2000) { setError("备注不能超过 2000 个字符。"); return; }
    setError("");
    await onStart({ category, quantity: amount, remark });
  }

  return (
    <form className="work-form" onSubmit={(event) => { void submit(event); }} noValidate>
      <div className="field-row">
        <label>工作类别
          <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={disabled}>
            <option value="">请选择类别</option>
            {CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>工作数量
          <input type="number" inputMode="decimal" min="0" max="1000000000" step="any"
            placeholder="大于 0" value={quantity} disabled={disabled}
            onChange={(event) => setQuantity(event.target.value)} />
        </label>
      </div>
      <label>备注 <span className="optional">选填</span>
        <textarea rows={2} maxLength={4000} placeholder="记下这次工作的内容…" value={remark}
          disabled={disabled} onChange={(event) => setRemark(event.target.value)} />
      </label>
      {switching && <p className="hint">开始后将结束并保存当前已暂停的任务。</p>}
      {error && <p className="inline-error" role="alert">{error}</p>}
      <button type="submit" disabled={disabled}>{switching ? "保存上一项，开始新工作" : "开始工作"}<span aria-hidden="true">↗</span></button>
    </form>
  );
}
