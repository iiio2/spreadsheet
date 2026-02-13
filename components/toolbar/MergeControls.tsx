import { useSpreadsheet } from "@/context/SpreadsheetContext";
import { normalizeSelection } from "@/utils/cellUtils";
import { selectionContainsMerge } from "@/utils/mergeUtils";

export default function MergeControls() {
  const { state, dispatch } = useSpreadsheet();

  const sel = state.selection;
  const norm = sel ? normalizeSelection(sel) : null;

  const isMultiCell =
    norm !== null && (norm.maxRow > norm.minRow || norm.maxCol > norm.minCol);

  const hasMerge =
    norm !== null &&
    selectionContainsMerge(
      norm.minRow,
      norm.maxRow,
      norm.minCol,
      norm.maxCol,
      state.merges,
      state.rows,
      state.columns
    );

  const btnBase =
    "px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex items-center gap-1">
      <button
        className={btnBase}
        disabled={!isMultiCell}
        onClick={() => dispatch({ type: "MERGE_CELLS" })}
        title="Merge selected cells"
      >
        Merge
      </button>
      <button
        className={btnBase}
        disabled={!hasMerge}
        onClick={() => dispatch({ type: "UNMERGE_CELLS" })}
        title="Unmerge selected cells"
      >
        Unmerge
      </button>
    </div>
  );
}