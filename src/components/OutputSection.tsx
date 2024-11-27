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
} from "./ui/table";

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
      }}
    >
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
  );
};

export default OutputSection;
