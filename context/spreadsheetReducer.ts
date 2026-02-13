import type {
  SpreadsheetState,
  CellData,
  CellKey,
  TextAlign,
  VerticalAlign,
  RowId,
  ColId,
  SelectionState,
} from "@/types/spreadsheet";
import { createDefaultCell } from "@/types/spreadsheet";
import {
  getCellKey,
  generateRowId,
  generateColId,
  columnIndexToLabel,
} from "@/utils/cellUtils";
import { normalizeSelection } from "@/utils/cellUtils";
import { getSelectedCellKeys } from "@/utils/mergeUtils";
import { compareValues } from "@/utils/sortUtils";

export type SpreadsheetAction =
  | { type: "ADD_ROW"; position: "above" | "below"; referenceIndex: number }
  | { type: "DELETE_ROW"; rowId: RowId }
  | { type: "ADD_COLUMN"; position: "left" | "right"; referenceIndex: number }
  | { type: "DELETE_COLUMN"; colId: ColId }
  | { type: "SET_CELL_VALUE"; rowId: RowId; colId: ColId; value: string }
  | { type: "START_EDITING"; cellKey: CellKey }
  | { type: "STOP_EDITING" }
  | { type: "SET_SELECTION"; selection: SelectionState }
  | { type: "CLEAR_SELECTION" }
  | { type: "TOGGLE_BOLD" }
  | { type: "TOGGLE_ITALIC" }
  | { type: "SET_TEXT_ALIGN"; align: TextAlign }
  | { type: "SET_VERTICAL_ALIGN"; align: VerticalAlign }
  | { type: "SET_BACKGROUND_COLOR"; color: string }
  | { type: "MERGE_CELLS" }
  | { type: "UNMERGE_CELLS" }
  | { type: "SORT_COLUMN"; colId: ColId; direction: "asc" | "desc" }
  | { type: "RESIZE_COLUMN"; colId: ColId; width: number }
  | { type: "RESIZE_ROW"; rowId: RowId; height: number }
  | { type: "REORDER_ROW"; fromIndex: number; toIndex: number }
  | { type: "REORDER_COLUMN"; fromIndex: number; toIndex: number }
  | { type: "LOAD_STATE"; state: SpreadsheetState }
  | { type: "RESET"; initialState: SpreadsheetState };

function getCell(
  cells: Record<string, CellData>,
  rowId: RowId,
  colId: ColId
): CellData {
  return cells[getCellKey(rowId, colId)] || createDefaultCell();
}

function applyToSelectedCells(
  state: SpreadsheetState,
  updater: (cell: CellData) => CellData
): Record<string, CellData> {
  if (!state.selection) return state.cells;
  const { minRow, maxRow, minCol, maxCol } = normalizeSelection(state.selection);
  const keys = getSelectedCellKeys(
    minRow, maxRow, minCol, maxCol, state.rows, state.columns
  );
  const newCells = { ...state.cells };
  for (const key of keys) {
    const existing = newCells[key] || createDefaultCell();
    newCells[key] = updater(existing);
  }
  return newCells;
}

export function spreadsheetReducer(
  state: SpreadsheetState,
  action: SpreadsheetAction
): SpreadsheetState {
  switch (action.type) {
    case "ADD_ROW": {
      const insertIdx =
        action.position === "below"
          ? action.referenceIndex + 1
          : action.referenceIndex;
      const newRow = {
        id: generateRowId(state.nextRowNum),
        height: 32,
      };
      const newRows = [...state.rows];
      newRows.splice(insertIdx, 0, newRow);
      return { ...state, rows: newRows, nextRowNum: state.nextRowNum + 1 };
    }

    case "DELETE_ROW": {
      if (state.rows.length <= 1) return state;
      const newRows = state.rows.filter((r) => r.id !== action.rowId);
      const newCells = { ...state.cells };
      for (const key of Object.keys(newCells)) {
        if (key.startsWith(action.rowId + ":")) {
          delete newCells[key];
        }
      }
      const newMerges = state.merges.filter(
        (m) => m.anchorRow !== action.rowId
      );
      return {
        ...state,
        rows: newRows,
        cells: newCells,
        merges: newMerges,
        selection: null,
      };
    }

    case "ADD_COLUMN": {
      const insertIdx =
        action.position === "right"
          ? action.referenceIndex + 1
          : action.referenceIndex;
      const newCol = {
        id: generateColId(state.nextColNum),
        width: 120,
        label: columnIndexToLabel(state.nextColNum),
      };
      const newCols = [...state.columns];
      newCols.splice(insertIdx, 0, newCol);
      // Relabel all columns based on position
      const relabeled = newCols.map((c, i) => ({
        ...c,
        label: columnIndexToLabel(i),
      }));
      return {
        ...state,
        columns: relabeled,
        nextColNum: state.nextColNum + 1,
      };
    }

    case "DELETE_COLUMN": {
      if (state.columns.length <= 1) return state;
      const newCols = state.columns
        .filter((c) => c.id !== action.colId)
        .map((c, i) => ({ ...c, label: columnIndexToLabel(i) }));
      const newCells = { ...state.cells };
      for (const key of Object.keys(newCells)) {
        if (key.endsWith(":" + action.colId)) {
          delete newCells[key];
        }
      }
      const newMerges = state.merges.filter(
        (m) => m.anchorCol !== action.colId
      );
      return {
        ...state,
        columns: newCols,
        cells: newCells,
        merges: newMerges,
        selection: null,
      };
    }

    case "SET_CELL_VALUE": {
      const key = getCellKey(action.rowId, action.colId);
      const existing = state.cells[key] || createDefaultCell();
      return {
        ...state,
        cells: {
          ...state.cells,
          [key]: { ...existing, value: action.value },
        },
      };
    }

    case "START_EDITING":
      return { ...state, editingCell: action.cellKey };

    case "STOP_EDITING":
      return { ...state, editingCell: null };

    case "SET_SELECTION":
      return { ...state, selection: action.selection };

    case "CLEAR_SELECTION":
      return { ...state, selection: null };

    case "TOGGLE_BOLD": {
      if (!state.selection) return state;
      const { minRow, maxRow, minCol, maxCol } = normalizeSelection(state.selection);
      const keys = getSelectedCellKeys(minRow, maxRow, minCol, maxCol, state.rows, state.columns);
      const anyNotBold = keys.some((k) => !(state.cells[k]?.style?.bold));
      const newCells = applyToSelectedCells(state, (cell) => ({
        ...cell,
        style: { ...cell.style, bold: anyNotBold },
      }));
      return { ...state, cells: newCells };
    }

    case "TOGGLE_ITALIC": {
      if (!state.selection) return state;
      const { minRow, maxRow, minCol, maxCol } = normalizeSelection(state.selection);
      const keys = getSelectedCellKeys(minRow, maxRow, minCol, maxCol, state.rows, state.columns);
      const anyNotItalic = keys.some((k) => !(state.cells[k]?.style?.italic));
      const newCells = applyToSelectedCells(state, (cell) => ({
        ...cell,
        style: { ...cell.style, italic: anyNotItalic },
      }));
      return { ...state, cells: newCells };
    }

    case "SET_TEXT_ALIGN": {
      const newCells = applyToSelectedCells(state, (cell) => ({
        ...cell,
        style: { ...cell.style, textAlign: action.align },
      }));
      return { ...state, cells: newCells };
    }

    case "SET_VERTICAL_ALIGN": {
      const newCells = applyToSelectedCells(state, (cell) => ({
        ...cell,
        style: { ...cell.style, verticalAlign: action.align },
      }));
      return { ...state, cells: newCells };
    }

    case "SET_BACKGROUND_COLOR": {
      const newCells = applyToSelectedCells(state, (cell) => ({
        ...cell,
        style: { ...cell.style, backgroundColor: action.color },
      }));
      return { ...state, cells: newCells };
    }

    case "MERGE_CELLS": {
      if (!state.selection) return state;
      const { minRow, maxRow, minCol, maxCol } = normalizeSelection(state.selection);
      const rowSpan = maxRow - minRow + 1;
      const colSpan = maxCol - minCol + 1;
      if (rowSpan <= 1 && colSpan <= 1) return state;

      const anchorRow = state.rows[minRow]?.id;
      const anchorCol = state.columns[minCol]?.id;
      if (!anchorRow || !anchorCol) return state;

      // Clear non-anchor cell values
      const newCells = { ...state.cells };
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (r === minRow && c === minCol) continue;
          const key = getCellKey(state.rows[r].id, state.columns[c].id);
          if (newCells[key]) {
            newCells[key] = { ...newCells[key], value: "" };
          }
        }
      }

      return {
        ...state,
        cells: newCells,
        merges: [...state.merges, { anchorRow, anchorCol, rowSpan, colSpan }],
      };
    }

    case "UNMERGE_CELLS": {
      if (!state.selection) return state;
      const { minRow, maxRow, minCol, maxCol } = normalizeSelection(state.selection);
      const newMerges = state.merges.filter((m) => {
        const ri = state.rows.findIndex((r) => r.id === m.anchorRow);
        const ci = state.columns.findIndex((c) => c.id === m.anchorCol);
        return !(ri >= minRow && ri <= maxRow && ci >= minCol && ci <= maxCol);
      });
      return { ...state, merges: newMerges };
    }

    case "SORT_COLUMN": {
      const { colId, direction } = action;
      const sortedRows = [...state.rows].sort((a, b) => {
        const aVal = getCell(state.cells, a.id, colId).value;
        const bVal = getCell(state.cells, b.id, colId).value;
        const cmp = compareValues(aVal, bVal);
        return direction === "asc" ? cmp : -cmp;
      });
      return { ...state, rows: sortedRows, selection: null };
    }

    case "RESIZE_COLUMN": {
      const newCols = state.columns.map((c) =>
        c.id === action.colId ? { ...c, width: Math.max(40, action.width) } : c
      );
      return { ...state, columns: newCols };
    }

    case "RESIZE_ROW": {
      const newRows = state.rows.map((r) =>
        r.id === action.rowId ? { ...r, height: Math.max(20, action.height) } : r
      );
      return { ...state, rows: newRows };
    }

    case "REORDER_ROW": {
      const newRows = [...state.rows];
      const [moved] = newRows.splice(action.fromIndex, 1);
      newRows.splice(action.toIndex, 0, moved);
      return { ...state, rows: newRows };
    }

    case "REORDER_COLUMN": {
      const newCols = [...state.columns];
      const [moved] = newCols.splice(action.fromIndex, 1);
      newCols.splice(action.toIndex, 0, moved);
      const relabeled = newCols.map((c, i) => ({
        ...c,
        label: columnIndexToLabel(i),
      }));
      return { ...state, columns: relabeled };
    }

    case "LOAD_STATE":
      return { ...action.state, selection: null, editingCell: null };

    case "RESET":
      return action.initialState;

    default:
      return state;
  }
}