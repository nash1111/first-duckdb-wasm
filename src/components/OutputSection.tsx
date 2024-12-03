import React from "react";
import { Output } from "../App";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bar, BarChart } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

interface OutputSectionProps {
  output: Output | null;
}

const OutputSection: React.FC<OutputSectionProps> = ({ output }) => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        height: "100%",
      }}
    >
      <div style={{ flex: 0.8 }}>
        <h2 style={{ margin: 0, paddingBottom: "10px" }}>Output</h2>
        {output?.data && output.data.length > 0 ? (
          <Table>
            <TableCaption>Data Output</TableCaption>
            <TableHeader>
              <TableRow>
                {Object.keys(output.data[0]).map((key, index) => (
                  <TableHead key={index}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {output.data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <TableCell key={colIndex}>
                      {typeof value === "number" ? value : String(value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <pre
            style={{
              flex: 1,
              backgroundColor: "#f4f4f4",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflowY: "scroll",
            }}
          >
            {output?.message || "No results to display."}
          </pre>
        )}
      </div>
      <div style={{ flex: 0.2 }}>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={chartData}>
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default OutputSection;