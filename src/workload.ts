import { formatQuantity } from "./history.ts";
export interface TodayWorkload {
  category: string;
  quantity: number;
  pending: number;
  records: number;
  complete: number;
}
export function workloadLabel(item: TodayWorkload) {
  return {
    main: item.complete > 0 ? formatQuantity(item.quantity) : "待补填",
    pending:
      item.complete > 0 && item.pending > 0 ? `待补填 ${item.pending}` : null,
  };
}
