import { useSpreadsheet } from "@/context/SpreadsheetContext";
import { normalizeSelection } from "@/utils/cellUtils";

export default function GridActions() {
  const { state, dispatch } = useSpreadsheet();

  const sel = state.selection;
  const hasSelection = sel !== null;

  const btnBase =
    "px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  function addRow(position: "above" | "below") {
    if (!sel) return;
    const { minRow, maxRow } = normalizeSelection(sel);
    const refIdx = position === "above" ? minRow : maxRow;
    dispatch({ type: "ADD_ROW", position, referenceIndex: refIdx });
  }

  function addColumn(position: "left" | "right") {
    if (!sel) return;
    const { minCol, maxCol } = normalizeSelection(sel);
    const refIdx = position === "left" ? minCol : maxCol;
    dispatch({ type: "ADD_COLUMN", position, referenceIndex: refIdx });
  }

  function deleteRow() {
    if (!sel) return;
    const { minRow, maxRow } = normalizeSelection(sel);
    for (let i = maxRow; i >= minRow; i--) {
      if (state.rows[i]) {
        dispatch({ type: "DELETE_ROW", rowId: state.rows[i].id });
      }
    }
  }

  function deleteColumn() {
    if (!sel) return;
    const { minCol, maxCol } = normalizeSelection(sel);
    for (let i = maxCol; i >= minCol; i--) {
      if (state.columns[i]) {
        dispatch({ type: "DELETE_COLUMN", colId: state.columns[i].id });
      }
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button className={btnBase} disabled={!hasSelection} onClick={() => addRow("above")} title="Insert row above">
        + Row Above
      </button>
      <button className={btnBase} disabled={!hasSelection} onClick={() => addRow("below")} title="Insert row below">
        + Row Below
      </button>
      <button className={btnBase} disabled={!hasSelection} onClick={() => addColumn("left")} title="Insert column left">
        + Col Left
      </button>
      <button className={btnBase} disabled={!hasSelection} onClick={() => addColumn("right")} title="Insert column right">
        + Col Right
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <button
        className={`${btnBase} text-red-600 hover:bg-red-50`}
        disabled={!hasSelection || state.rows.length <= 1}
        onClick={deleteRow}
        title="Delete selected row(s)"
      >
        - Row
      </button>
      <button
        className={`${btnBase} text-red-600 hover:bg-red-50`}
        disabled={!hasSelection || state.columns.length <= 1}
        onClick={deleteColumn}
        title="Delete selected column(s)"
      >
        - Col
      </button>
    </div>
  );
}