import type { SpreadsheetState, RowMeta, ColumnMeta } from "@/types/spreadsheet";
import { generateRowId, generateColId, columnIndexToLabel } from "@/utils/cellUtils";

export function createInitialState(
  rowCount = 20,
  colCount = 10
): SpreadsheetState {
  const rows: RowMeta[] = [];
  const columns: ColumnMeta[] = [];

  for (let i = 0; i < rowCount; i++) {
    rows.push({ id: generateRowId(i), height: 32 });
  }

  for (let i = 0; i < colCount; i++) {
    columns.push({
      id: generateColId(i),
      width: 120,
      label: columnIndexToLabel(i),
    });
  }

  return {
    rows,
    columns,
    cells: {},
    merges: [],
    selection: null,
    editingCell: null,
    nextRowNum: rowCount,
    nextColNum: colCount,
  };
}