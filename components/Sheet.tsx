import { useRef, useCallback, useEffect, useState } from "react";
import { useSpreadsheet } from "@/context/SpreadsheetContext";
import { getCellKey } from "@/utils/cellUtils";
import type { CellKey } from "@/types/spreadsheet";
import ColumnHeaders from "./ColumnHeaders";
import RowHeader from "./RowHeader";
import Cell from "./Cell";

export default function Sheet() {
  const { state, dispatch, getCell, isCellSelected, isCellHidden, getMerge } =
    useSpreadsheet();
  const tableRef = useRef<HTMLTableElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Get cell coords from a mouse event target
  const getCellFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const target = (e.target as HTMLElement).closest("td[data-row-idx]");
      if (!target) return null;
      const rowIdx = parseInt(target.getAttribute("data-row-idx") || "", 10);
      const colIdx = parseInt(target.getAttribute("data-col-idx") || "", 10);
      if (isNaN(rowIdx) || isNaN(colIdx)) return null;
      return { rowIdx, colIdx };
    },
    []
  );

  // Mouse selection
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const cell = getCellFromEvent(e);
      if (!cell) return;

      dispatch({
        type: "SET_SELECTION",
        selection: {
          startRow: cell.rowIdx,
          startCol: cell.colIdx,
          endRow: cell.rowIdx,
          endCol: cell.colIdx,
        },
      });

      if (state.editingCell) {
        dispatch({ type: "STOP_EDITING" });
      }

      setIsSelecting(true);
    },
    [getCellFromEvent, dispatch, state.editingCell]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !state.selection) return;
      const cell = getCellFromEvent(e);
      if (!cell) return;

      if (
        cell.rowIdx !== state.selection.endRow ||
        cell.colIdx !== state.selection.endCol
      ) {
        dispatch({
          type: "SET_SELECTION",
          selection: {
            ...state.selection,
            endRow: cell.rowIdx,
            endCol: cell.colIdx,
          },
        });
      }
    },
    [isSelecting, state.selection, getCellFromEvent, dispatch]
  );

  useEffect(() => {
    const handleUp = () => setIsSelecting(false);
    document.addEventListener("mouseup", handleUp);
    return () => document.removeEventListener("mouseup", handleUp);
  }, []);

  // Double-click to edit
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const cell = getCellFromEvent(e);
      if (!cell) return;
      const rowId = state.rows[cell.rowIdx]?.id;
      const colId = state.columns[cell.colIdx]?.id;
      if (!rowId || !colId) return;
      const cellKey = getCellKey(rowId, colId) as CellKey;
      dispatch({ type: "START_EDITING", cellKey });
    },
    [getCellFromEvent, state.rows, state.columns, dispatch]
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!state.selection) return;

      const { startRow, startCol } = state.selection;

      // If editing, let the editor handle it
      if (state.editingCell) {
        return;
      }

      const maxRow = state.rows.length - 1;
      const maxCol = state.columns.length - 1;

      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        let newRow = startRow;
        let newCol = startCol;
        if (e.key === "ArrowUp") newRow = Math.max(0, startRow - 1);
        if (e.key === "ArrowDown") newRow = Math.min(maxRow, startRow + 1);
        if (e.key === "ArrowLeft") newCol = Math.max(0, startCol - 1);
        if (e.key === "ArrowRight") newCol = Math.min(maxCol, startCol + 1);
        dispatch({
          type: "SET_SELECTION",
          selection: { startRow: newRow, startCol: newCol, endRow: newRow, endCol: newCol },
        });
      } else if (e.key === "Tab") {
        e.preventDefault();
        const newCol = e.shiftKey
          ? Math.max(0, startCol - 1)
          : Math.min(maxCol, startCol + 1);
        dispatch({
          type: "SET_SELECTION",
          selection: { startRow, startCol: newCol, endRow: startRow, endCol: newCol },
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          const newRow = Math.max(0, startRow - 1);
          dispatch({
            type: "SET_SELECTION",
            selection: { startRow: newRow, startCol, endRow: newRow, endCol: startCol },
          });
        } else {
          // Start editing on Enter
          const rowId = state.rows[startRow]?.id;
          const colId = state.columns[startCol]?.id;
          if (rowId && colId) {
            dispatch({ type: "START_EDITING", cellKey: getCellKey(rowId, colId) as CellKey });
          }
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        // Clear selected cells
        const { rows, columns } = state;
        const sel = state.selection;
        const minR = Math.min(sel.startRow, sel.endRow);
        const maxR = Math.max(sel.startRow, sel.endRow);
        const minC = Math.min(sel.startCol, sel.endCol);
        const maxC = Math.max(sel.startCol, sel.endCol);
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            dispatch({
              type: "SET_CELL_VALUE",
              rowId: rows[r].id,
              colId: columns[c].id,
              value: "",
            });
          }
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // Start editing with the typed character
        const rowId = state.rows[startRow]?.id;
        const colId = state.columns[startCol]?.id;
        if (rowId && colId) {
          dispatch({ type: "SET_CELL_VALUE", rowId, colId, value: "" });
          dispatch({ type: "START_EDITING", cellKey: getCellKey(rowId, colId) as CellKey });
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.selection, state.editingCell, state.rows, state.columns, dispatch]);

  // Handlers for resize
  const handleColResize = useCallback(
    (colId: string, delta: number) => {
      const col = state.columns.find((c) => c.id === colId);
      if (col) {
        dispatch({ type: "RESIZE_COLUMN", colId, width: col.width + delta });
      }
    },
    [state.columns, dispatch]
  );

  const handleRowResize = useCallback(
    (rowId: string, delta: number) => {
      const row = state.rows.find((r) => r.id === rowId);
      if (row) {
        dispatch({ type: "RESIZE_ROW", rowId, height: row.height + delta });
      }
    },
    [state.rows, dispatch]
  );

  return (
    <div className="flex-1 overflow-auto">
      <table
        ref={tableRef}
        className="border-collapse"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
      >
        <ColumnHeaders columns={state.columns} onResize={handleColResize} />
        <tbody>
          {state.rows.map((row, rowIdx) => (
            <tr key={row.id}>
              <RowHeader
                index={rowIdx}
                height={row.height}
                rowId={row.id}
                onResize={handleRowResize}
              />
              {state.columns.map((col, colIdx) => {
                // Skip cells hidden by merges
                const hidden = isCellHidden(row.id, col.id);
                if (hidden) return null;

                const cellKey = getCellKey(row.id, col.id) as CellKey;
                const cellData = getCell(row.id, col.id);
                const merge = getMerge(row.id, col.id);
                const selected = isCellSelected(rowIdx, colIdx);
                const editing = state.editingCell === cellKey;

                return (
                  <Cell
                    key={col.id}
                    cellData={cellData}
                    cellKey={cellKey}
                    rowIdx={rowIdx}
                    colIdx={colIdx}
                    isSelected={selected}
                    isEditing={editing}
                    merge={merge}
                    width={col.width}
                    height={row.height}
                    onCommit={(value) => {
                      dispatch({
                        type: "SET_CELL_VALUE",
                        rowId: row.id,
                        colId: col.id,
                        value,
                      });
                      dispatch({ type: "STOP_EDITING" });
                    }}
                    onCancel={() => dispatch({ type: "STOP_EDITING" })}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}