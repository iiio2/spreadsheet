import { useCallback } from "react";

interface ResizeHandleProps {
  axis: "horizontal" | "vertical";
  onResizeEnd: (delta: number) => void;
}

export default function ResizeHandle({ axis, onResizeEnd }: ResizeHandleProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startPos = axis === "horizontal" ? e.clientX : e.clientY;

      const handleMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        const endPos = axis === "horizontal" ? ev.clientX : ev.clientY;
        onResizeEnd(endPos - startPos);
      };

      const handleMouseMove = (ev: MouseEvent) => {
        ev.preventDefault();
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [axis, onResizeEnd]
  );

  if (axis === "horizontal") {
    return (
      <div
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-400 z-20"
      />
    );
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute bottom-0 left-0 h-1 w-full cursor-row-resize hover:bg-blue-400 z-20"
    />
  );
}