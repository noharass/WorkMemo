import { Collapse, Table } from "antd";

/** The same server aggregates as the canvas, with keyboard-readable values. */
export function ChartDataTable({ title, rows }: {
  title: string; rows: readonly { label: string; duration_ms: number }[];
}) {
  return <Collapse className="dc-chart-data" size="small" items={[{
    key: "data", label: `查看${title}数据`,
    children: <Table aria-label={`${title}数据`} rowKey="label" size="small"
      dataSource={[...rows]} pagination={{pageSize:12,showSizeChanger:false,hideOnSinglePage:true}}
      locale={{emptyText:"当前范围没有有效工时数据。"}}
      columns={[
        {title:"周期",dataIndex:"label",rowScope:"row"},
        {title:"有效工时（秒）",dataIndex:"duration_ms",render:(value:number)=>(value / 1000).toLocaleString("zh-CN",{maximumFractionDigits:3})},
      ]} />,
  }]} />;
}
