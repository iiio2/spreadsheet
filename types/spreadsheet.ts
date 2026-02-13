export type RowId = string;
export type ColId = string;
export type CellKey = `${RowId}:${ColId}`;

export type TextAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";

export interface CellStyle {
  bold: boolean;
  italic: boolean;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  backgroundColor: string;
}

export interface CellData {
  value: string;
  style: CellStyle;
}

export interface MergeRegion {
  anchorRow: RowId;
  anchorCol: ColId;
  rowSpan: number;
  colSpan: number;
}

export interface ColumnMeta {
  id: ColId;
  width: number;
  label: string;
}

export interface RowMeta {
  id: RowId;
  height: number;
}

export interface SelectionState {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface SpreadsheetState {
  rows: RowMeta[];
  columns: ColumnMeta[];
  cells: Record<string, CellData>;
  merges: MergeRegion[];
  selection: SelectionState | null;
  editingCell: CellKey | null;
  nextRowNum: number;
  nextColNum: number;
}

export const DEFAULT_CELL_STYLE: CellStyle = {
  bold: false,
  italic: false,
  textAlign: "left",
  verticalAlign: "middle",
  backgroundColor: "#ffffff",
};

export function createDefaultCell(): CellData {
  return { value: "", style: { ...DEFAULT_CELL_STYLE } };
}