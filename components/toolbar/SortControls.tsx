import { useSpreadsheet } from "@/context/SpreadsheetContext";
import { normalizeSelection } from "@/utils/cellUtils";

export default function SortControls() {
  const { state, dispatch } = useSpreadsheet();

  const sel = state.selection;
  const hasSelection = sel !== null;
  const colId = hasSelection
    ? state.columns[normalizeSelection(sel).minCol]?.id
    : undefined;

  const btnBase =
    "px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex items-center gap-1">
      <button
        className={btnBase}
        disabled={!colId}
        onClick={() => colId && dispatch({ type: "SORT_COLUMN", colId, direction: "asc" })}
        title="Sort column A to Z"
      >
        Sort A-Z
      </button>
      <button
        className={btnBase}
        disabled={!colId}
        onClick={() => colId && dispatch({ type: "SORT_COLUMN", colId, direction: "desc" })}
        title="Sort column Z to A"
      >
        Sort Z-A
      </button>
    </div>
  );
}