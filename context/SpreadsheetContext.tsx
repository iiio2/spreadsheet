import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type {
  SpreadsheetState,
  CellData,
  RowId,
  ColId,
  CellKey,
} from "@/types/spreadsheet";
import { createDefaultCell } from "@/types/spreadsheet";
import { getCellKey, normalizeSelection } from "@/utils/cellUtils";
import { isCellHiddenByMerge, getMergeForAnchor, getSelectedCellKeys } from "@/utils/mergeUtils";
import { spreadsheetReducer, type SpreadsheetAction } from "./spreadsheetReducer";
import { createInitialState } from "./initialState";

const STORAGE_KEY = "spreadsheet-data";

interface SpreadsheetContextValue {
  state: SpreadsheetState;
  dispatch: React.Dispatch<SpreadsheetAction>;
  getCell: (rowId: RowId, colId: ColId) => CellData;
  isCellSelected: (rowIdx: number, colIdx: number) => boolean;
  isCellHidden: (rowId: RowId, colId: ColId) => ReturnType<typeof isCellHiddenByMerge>;
  getMerge: (rowId: RowId, colId: ColId) => ReturnType<typeof getMergeForAnchor>;
  getSelectedKeys: () => CellKey[];
}

const SpreadsheetContext = createContext<SpreadsheetContextValue | null>(null);

export function SpreadsheetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    spreadsheetReducer,
    null,
    () => createInitialState()
  );

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SpreadsheetState;
        if (parsed.rows && parsed.columns) {
          dispatch({ type: "LOAD_STATE", state: parsed });
        }
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  // Save to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const toSave = { ...state, selection: null, editingCell: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

  function getCellData(rowId: RowId, colId: ColId): CellData {
    return state.cells[getCellKey(rowId, colId)] || createDefaultCell();
  }

  function isCellSelectedFn(rowIdx: number, colIdx: number): boolean {
    if (!state.selection) return false;
    const { minRow, maxRow, minCol, maxCol } = normalizeSelection(state.selection);
    return rowIdx >= minRow && rowIdx <= maxRow && colIdx >= minCol && colIdx <= maxCol;
  }

  function isCellHiddenFn(rowId: RowId, colId: ColId) {
    return isCellHiddenByMerge(rowId, colId, state.merges, state.rows, state.columns);
  }

  function getMergeFn(rowId: RowId, colId: ColId) {
    return getMergeForAnchor(rowId, colId, state.merges);
  }

  function getSelectedKeysFn(): CellKey[] {
    if (!state.selection) return [];
    const { minRow, maxRow, minCol, maxCol } = normalizeSelection(state.selection);
    return getSelectedCellKeys(minRow, maxRow, minCol, maxCol, state.rows, state.columns);
  }

  return (
    <SpreadsheetContext.Provider
      value={{
        state,
        dispatch,
        getCell: getCellData,
        isCellSelected: isCellSelectedFn,
        isCellHidden: isCellHiddenFn,
        getMerge: getMergeFn,
        getSelectedKeys: getSelectedKeysFn,
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheet() {
  const ctx = useContext(SpreadsheetContext);
  if (!ctx) throw new Error("useSpreadsheet must be used within SpreadsheetProvider");
  return ctx;
}