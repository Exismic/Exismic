import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <History className="text-violet-500 w-8 h-8" />
        <h1 className="text-4xl font-bold font-outfit">Processing History</h1>
      </div>
      <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
        <p className="text-zinc-500">No processing history found. Start by trying out a tool!</p>
      </div>
    </div>
  );
}
