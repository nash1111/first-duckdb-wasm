import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Output } from "@/App";

const VisualizeSection = ({ output }: { output: Output | null }) => {
  const data = output?.data || [];

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
          <div style={{ textAlign: "center", padding: "20px" }}>
            No query results available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const keys = Object.keys(data[0]);
  const xKey = keys[0];
  const yKeys = keys.slice(1);

  const dynamicChartConfig: Record<string, { label: string; color: string }> =
    {};
  yKeys.forEach((key, index) => {
    dynamicChartConfig[key] = {
      label: key,
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });

  return (
    <Card style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Visualization of Query Results</CardDescription>
      </CardHeader>
      <CardContent style={{ width: "100%", height: "80%" }}>
        <ChartContainer config={dynamicChartConfig}>
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
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing results from the query output
        </div>
      </CardFooter>
    </Card>
  );
};

export default VisualizeSection;
