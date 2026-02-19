export default function BottomTransferPanel() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t shadow z-40">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center gap-6">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-sm">
              Transferring Files...
            </span>
            <span className="text-primary font-bold">34%</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full">
            <div className="bg-primary h-2 rounded-full w-[34%]" />
          </div>
        </div>

        <button className="px-4 py-2 border rounded-lg">
          Pause
        </button>

        <button className="px-4 py-2 border rounded-lg text-red-500">
          Cancel
        </button>
      </div>
    </div>
  );
}
