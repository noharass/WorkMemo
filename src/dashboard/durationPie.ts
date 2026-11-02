/** Ratios use the unrounded backend milliseconds, including ended pending records. */
export function durationSlices(categories: readonly { category: string; duration_ms: number }[]) {
  const positive = categories.filter(row => Number.isFinite(row.duration_ms) && row.duration_ms > 0);
  const total = positive.reduce((sum, row) => sum + row.duration_ms, 0);
  return positive.map(row => {
    const percent = row.duration_ms / total * 100;
    return {
      category: row.category,
      value: row.duration_ms,
      percent,
      percentLabel: percent < 0.01 ? "不足 0.01%" : `${Number(percent.toFixed(2))}%`,
    };
  });
}
