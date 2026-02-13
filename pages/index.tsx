import Toolbar from "@/components/Toolbar";
import Sheet from "@/components/Sheet";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <Sheet />
    </div>
  );
}