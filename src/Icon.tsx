import type { CSSProperties } from "react";
import {
  HomeOutlined, HistoryOutlined, SkinOutlined, AppstoreOutlined,
  FileTextOutlined, CheckCircleOutlined, PauseOutlined, CaretRightFilled,
  CloseOutlined, SyncOutlined, MinusOutlined, ArrowUpOutlined,
  SettingOutlined, ClockCircleOutlined, SearchOutlined, DeleteOutlined,
  BarChartOutlined, UnorderedListOutlined, LeftOutlined, RightOutlined,
  CheckSquareOutlined, SafetyCertificateOutlined, CodeOutlined, StarOutlined,
  RocketOutlined, BulbOutlined, ToolOutlined, ReadOutlined,
} from "@ant-design/icons";

const icons = {
  home: HomeOutlined, history: HistoryOutlined, palette: SkinOutlined,
  checkSquare:CheckSquareOutlined,safety:SafetyCertificateOutlined,code:CodeOutlined,
  star:StarOutlined,rocket:RocketOutlined,bulb:BulbOutlined,tool:ToolOutlined,read:ReadOutlined,
  layout: AppstoreOutlined, note: FileTextOutlined, check: CheckCircleOutlined,
  pause: PauseOutlined, play: CaretRightFilled, close: CloseOutlined,
  refresh: SyncOutlined, minimize: MinusOutlined, open: ArrowUpOutlined,
  settings: SettingOutlined, clock: ClockCircleOutlined, search: SearchOutlined,
  delete: DeleteOutlined, chart: BarChartOutlined, list: UnorderedListOutlined,
  left: LeftOutlined, right: RightOutlined,
} as const;

export type IconName = keyof typeof icons;
export function Icon({ name, style }: { name: IconName; style?: CSSProperties }) {
  const Component = icons[name];
  return <Component className={`icon icon-${name}`} aria-hidden="true" style={style} />;
}
