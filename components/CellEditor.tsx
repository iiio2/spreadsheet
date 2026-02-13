import { useState, useRef, useEffect } from "react";
import type { CellStyle } from "@/types/spreadsheet";

interface CellEditorProps {
  initialValue: string;
  style: CellStyle;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

export default function CellEditor({
  initialValue,
  style,
  onCommit,
  onCancel,
}: CellEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      onCommit(value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Tab") {
      e.preventDefault();
      onCommit(value);
    }
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onCommit(value)}
      className="w-full h-full border-none outline-none bg-white px-1 text-sm"
      style={{
        fontWeight: style.bold ? "bold" : "normal",
        fontStyle: style.italic ? "italic" : "normal",
        textAlign: style.textAlign,
      }}
    />
  );
}