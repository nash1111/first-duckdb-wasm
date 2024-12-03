import React from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
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

interface OutputSectionProps {
  output: Output | null;
}

const OutputSection: React.FC<OutputSectionProps> = ({ output }) => {

  const chartData = output?.data
    ? output.data.reduce((acc, curr) => {
        const category = curr[Object.keys(curr)[0]];
        const value = curr[Object.keys(curr)[1]];

        if (!acc[category]) {
          acc[category] = { total: 0, count: 0 };
        }
        acc[category].total += value;
        acc[category].count += 1;
        return acc;
      }, {})
    : {};

  const formattedChartData = Object.entries(chartData).map(([category, { total, count }]) => ({
    category,
    average_value: total / count,
  }));

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
        <BarChart width={500} height={300} data={formattedChartData}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="average_value" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default OutputSection;