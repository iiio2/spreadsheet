import type { RowId, ColId, CellKey } from "@/types/spreadsheet";

export function getCellKey(rowId: RowId, colId: ColId): CellKey {
  return `${rowId}:${colId}` as CellKey;
}

export function parseCellKey(key: CellKey): { rowId: RowId; colId: ColId } {
  const [rowId, colId] = key.split(":");
  return { rowId, colId };
}

export function columnIndexToLabel(index: number): string {
  let label = "";
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
}

export function generateRowId(num: number): RowId {
  return `row-${num}`;
}

export function generateColId(num: number): ColId {
  return `col-${num}`;
}

export function normalizeSelection(sel: {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}) {
  return {
    minRow: Math.min(sel.startRow, sel.endRow),
    maxRow: Math.max(sel.startRow, sel.endRow),
    minCol: Math.min(sel.startCol, sel.endCol),
    maxCol: Math.max(sel.startCol, sel.endCol),
  };
}