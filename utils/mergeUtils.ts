import type {
  RowId,
  ColId,
  MergeRegion,
  RowMeta,
  ColumnMeta,
  CellKey,
} from "@/types/spreadsheet";
import { getCellKey } from "./cellUtils";

export function isCellHiddenByMerge(
  rowId: RowId,
  colId: ColId,
  merges: MergeRegion[],
  rows: RowMeta[],
  columns: ColumnMeta[]
): MergeRegion | null {
  const rowIdx = rows.findIndex((r) => r.id === rowId);
  const colIdx = columns.findIndex((c) => c.id === colId);

  for (const merge of merges) {
    const anchorRowIdx = rows.findIndex((r) => r.id === merge.anchorRow);
    const anchorColIdx = columns.findIndex((c) => c.id === merge.anchorCol);

    if (
      rowIdx >= anchorRowIdx &&
      rowIdx < anchorRowIdx + merge.rowSpan &&
      colIdx >= anchorColIdx &&
      colIdx < anchorColIdx + merge.colSpan
    ) {
      if (rowId === merge.anchorRow && colId === merge.anchorCol) {
        return null;
      }
      return merge;
    }
  }
  return null;
}

export function getMergeForAnchor(
  rowId: RowId,
  colId: ColId,
  merges: MergeRegion[]
): MergeRegion | undefined {
  return merges.find(
    (m) => m.anchorRow === rowId && m.anchorCol === colId
  );
}

export function getSelectedCellKeys(
  minRow: number,
  maxRow: number,
  minCol: number,
  maxCol: number,
  rows: RowMeta[],
  columns: ColumnMeta[]
): CellKey[] {
  const keys: CellKey[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (rows[r] && columns[c]) {
        keys.push(getCellKey(rows[r].id, columns[c].id));
      }
    }
  }
  return keys;
}

export function selectionContainsMerge(
  minRow: number,
  maxRow: number,
  minCol: number,
  maxCol: number,
  merges: MergeRegion[],
  rows: RowMeta[],
  columns: ColumnMeta[]
): boolean {
  for (const merge of merges) {
    const anchorRowIdx = rows.findIndex((r) => r.id === merge.anchorRow);
    const anchorColIdx = columns.findIndex((c) => c.id === merge.anchorCol);
    if (
      anchorRowIdx >= minRow &&
      anchorRowIdx <= maxRow &&
      anchorColIdx >= minCol &&
      anchorColIdx <= maxCol
    ) {
      return true;
    }
  }
  return false;
}