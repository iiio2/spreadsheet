import { useSpreadsheet } from "@/context/SpreadsheetContext";
import { createDefaultCell } from "@/types/spreadsheet";
import { normalizeSelection } from "@/utils/cellUtils";

export default function StyleControls() {
  const { state, dispatch } = useSpreadsheet();

  // Get style of the first selected cell for showing active state
  const activeStyle = (() => {
    if (!state.selection) return createDefaultCell().style;
    const { minRow, minCol } = normalizeSelection(state.selection);
    const row = state.rows[minRow];
    const col = state.columns[minCol];
    if (!row || !col) return createDefaultCell().style;
    const key = `${row.id}:${col.id}`;
    return state.cells[key]?.style ?? createDefaultCell().style;
  })();

  const btnBase =
    "px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors";
  const btnActive = "bg-blue-100 border-blue-400";

  return (
    <div className="flex items-center gap-1">
      <button
        className={`${btnBase} font-bold ${activeStyle.bold ? btnActive : ""}`}
        onClick={() => dispatch({ type: "TOGGLE_BOLD" })}
        title="Bold"
      >
        B
      </button>
      <button
        className={`${btnBase} italic ${activeStyle.italic ? btnActive : ""}`}
        onClick={() => dispatch({ type: "TOGGLE_ITALIC" })}
        title="Italic"
      >
        I
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Text alignment */}
      <button
        className={`${btnBase} ${activeStyle.textAlign === "left" ? btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_TEXT_ALIGN", align: "left" })}
        title="Align left"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
        </svg>
      </button>
      <button
        className={`${btnBase} ${activeStyle.textAlign === "center" ? btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_TEXT_ALIGN", align: "center" })}
        title="Align center"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
      </button>
      <button
        className={`${btnBase} ${activeStyle.textAlign === "right" ? btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_TEXT_ALIGN", align: "right" })}
        title="Align right"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Vertical alignment */}
      <button
        className={`${btnBase} text-xs ${activeStyle.verticalAlign === "top" ? btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_VERTICAL_ALIGN", align: "top" })}
        title="Vertical align top"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="4" x2="20" y2="4"/><polyline points="12 8 8 14 16 14"/>
        </svg>
      </button>
      <button
        className={`${btnBase} text-xs ${activeStyle.verticalAlign === "middle" ? btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_VERTICAL_ALIGN", align: "middle" })}
        title="Vertical align middle"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="12" x2="20" y2="12"/><polyline points="8 8 12 4 16 8"/><polyline points="8 16 12 20 16 16"/>
        </svg>
      </button>
      <button
        className={`${btnBase} text-xs ${activeStyle.verticalAlign === "bottom" ? btnActive : ""}`}
        onClick={() => dispatch({ type: "SET_VERTICAL_ALIGN", align: "bottom" })}
        title="Vertical align bottom"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="20" x2="20" y2="20"/><polyline points="8 14 12 20 16 14"/>
        </svg>
      </button>
    </div>
  );
}
