import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BaseTableProps {
  headers: string[];
  children: React.ReactNode;
}

export const BaseTable = ({ headers, children }: BaseTableProps) => (
  <div className="border border-gray-200 dark:border-gray-400 rounded-md overflow-x-auto shadow-sm bg-white dark:bg-black">
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-100 dark:bg-black border-b border-gray-200 dark:border-gray-400">
          {headers.map((h) => (
            <TableHead
              key={h}
              className="font-semibold text-gray-800 dark:text-gray-300 text-center py-2"
            >
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  </div>
);
