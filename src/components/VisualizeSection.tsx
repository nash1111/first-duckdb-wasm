import { useState } from "react";
import {
  ResponsiveContainer,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Output } from "@/App";

const VisualizeSection = ({ output }: { output: Output | null }) => {
  const data = output?.data || [];
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  if (!data.length) {
    return (
      <Card
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 128, 0, 0.5)",
          color: "white",
        }}
      >
        <CardHeader>
          <CardTitle>No Data</CardTitle>
          <CardDescription>Please run a query to see data</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ textAlign: "center", padding: "8px" }}>
            No query results available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const keys = Object.keys(data[0]);
  const xKey = keys[0];
  const yKeys = keys.slice(1);

  // TODO: modify color dynamically
  const dynamicChartConfig: Record<string, { label: string; color: string }> = {};
  yKeys.forEach((key, index) => {
    dynamicChartConfig[key] = {
      label: key,
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });

  return (
    <Card
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <CardHeader style={{ flex: "0 0 auto" }}>
        <CardTitle>Chart Visualization</CardTitle>
        <CardDescription>Choose your chart type</CardDescription>
        {/* TDOO: refactor, split files */}
        <Select value={chartType} onValueChange={(value) => setChartType(value as "bar" | "area")}>
          <SelectTrigger className="w-[180px] mt-2">
            <SelectValue placeholder="Select a chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="area">Area Chart</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <ChartContainer config={dynamicChartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              // BarChart
              <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={xKey}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                {yKeys.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={`var(--color-${key})`}
                    radius={4}
                  />
                ))}
              </BarChart>
            ) : (
              // AreaChart
              <AreaChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey={xKey}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                {yKeys.map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke="blue"
                    fill="blue"
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default VisualizeSection;
