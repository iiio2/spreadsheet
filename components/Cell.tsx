import type { CellData, CellKey, MergeRegion } from "@/types/spreadsheet";
import CellEditor from "./CellEditor";

interface CellProps {
  cellData: CellData;
  cellKey: CellKey;
  rowIdx: number;
  colIdx: number;
  isSelected: boolean;
  isEditing: boolean;
  merge?: MergeRegion;
  width: number;
  height: number;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

export default function Cell({
  cellData,
  cellKey,
  rowIdx,
  colIdx,
  isSelected,
  isEditing,
  merge,
  width,
  height,
  onCommit,
  onCancel,
}: CellProps) {
  const verticalAlignMap = {
    top: "start",
    middle: "center",
    bottom: "end",
  } as const;

  return (
    <td
      data-row-idx={rowIdx}
      data-col-idx={colIdx}
      data-cell-key={cellKey}
      rowSpan={merge?.rowSpan}
      colSpan={merge?.colSpan}
      className={`border border-gray-300 relative text-sm ${
        isSelected ? "outline outline-2 outline-blue-500 z-10" : ""
      }`}
      style={{
        width: merge ? undefined : width,
        minWidth: merge ? undefined : width,
        height: height,
        backgroundColor: cellData.style.backgroundColor,
        fontWeight: cellData.style.bold ? "bold" : "normal",
        fontStyle: cellData.style.italic ? "italic" : "normal",
        textAlign: cellData.style.textAlign,
        verticalAlign: verticalAlignMap[cellData.style.verticalAlign],
        padding: 0,
      }}
    >
      {isEditing ? (
        <CellEditor
          initialValue={cellData.value}
          style={cellData.style}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      ) : (
        <div
          className="px-1 w-full h-full flex items-center overflow-hidden whitespace-nowrap"
          style={{
            justifyContent:
              cellData.style.textAlign === "center"
                ? "center"
                : cellData.style.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
            alignItems: verticalAlignMap[cellData.style.verticalAlign],
          }}
        >
          {cellData.value}
        </div>
      )}
    </td>
  );
}