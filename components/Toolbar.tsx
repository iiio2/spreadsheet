import StyleControls from "./toolbar/StyleControls";
import ColorPicker from "./toolbar/ColorPicker";
import MergeControls from "./toolbar/MergeControls";
import SortControls from "./toolbar/SortControls";
import GridActions from "./toolbar/GridActions";

export default function Toolbar() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-300 flex-wrap">
      <StyleControls />
      <div className="w-px h-6 bg-gray-300" />
      <ColorPicker />
      <div className="w-px h-6 bg-gray-300" />
      <MergeControls />
      <div className="w-px h-6 bg-gray-300" />
      <SortControls />
      <div className="w-px h-6 bg-gray-300" />
      <GridActions />
    </div>
  );
}