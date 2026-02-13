import type { ColumnMeta } from "@/types/spreadsheet";
import ResizeHandle from "./ResizeHandle";

interface ColumnHeadersProps {
  columns: ColumnMeta[];
  onResize: (colId: string, delta: number) => void;
}

export default function ColumnHeaders({ columns, onResize }: ColumnHeadersProps) {
  return (
    <thead>
      <tr>
        <th className="sticky left-0 top-0 z-30 bg-gray-100 border border-gray-300 w-10 min-w-10 text-xs text-gray-500 font-normal" />
        {columns.map((col) => (
          <th
            key={col.id}
            className="sticky top-0 z-20 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-600 relative select-none"
            style={{ width: col.width, minWidth: col.width }}
          >
            {col.label}
            <ResizeHandle
              axis="horizontal"
              onResizeEnd={(delta) => onResize(col.id, delta)}
            />
          </th>
        ))}
      </tr>
    </thead>
  );
}
