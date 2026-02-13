import ResizeHandle from "./ResizeHandle";

interface RowHeaderProps {
  index: number;
  height: number;
  rowId: string;
  onResize: (rowId: string, delta: number) => void;
}

export default function RowHeader({ index, height, rowId, onResize }: RowHeaderProps) {
  return (
    <td
      className="sticky left-0 z-10 bg-gray-100 border border-gray-300 text-xs text-gray-500 text-center select-none relative"
      style={{ width: 40, minWidth: 40, height }}
    >
      {index + 1}
      <ResizeHandle
        axis="vertical"
        onResizeEnd={(delta) => onResize(rowId, delta)}
      />
    </td>
  );
}