import { useState } from "react";
import { useSpreadsheet } from "@/context/SpreadsheetContext";

const COLORS = [
  "#ffffff", "#f8f9fa", "#f28b82", "#fbbc04",
  "#ccff90", "#a7ffeb", "#cbf0f8", "#aecbfa",
  "#d7aefb", "#fdcfe8", "#e6c9a8", "#e8eaed",
  "#ff6d01", "#34a853", "#4285f4", "#ab47bc",
];

export default function ColorPicker() {
  const { dispatch } = useSpreadsheet();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 flex items-center gap-1"
        onClick={() => setOpen(!open)}
        title="Background color"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.2"/>
          <path d="M7 21V3h4l4 8 4-8h4v18"/>
        </svg>
        Fill
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-50 grid grid-cols-4 gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => {
                dispatch({ type: "SET_BACKGROUND_COLOR", color });
                setOpen(false);
              }}
            />
          ))}
          <input
            type="color"
            className="w-6 h-6 col-span-4 mt-1 cursor-pointer"
            onChange={(e) => {
              dispatch({ type: "SET_BACKGROUND_COLOR", color: e.target.value });
              setOpen(false);
            }}
            title="Custom color"
          />
        </div>
      )}
    </div>
  );
}