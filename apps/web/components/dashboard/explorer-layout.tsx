export default function ExplorerLayout() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[600px] min-h-[500px]">
      <Explorer title="Source Drive" />
      <TransferOptions />
      <Explorer title="Destination Path" />
    </div>
  );
}

function Explorer({ title }: { title: string }) {
  return (
    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border shadow-sm flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            folder_open
          </span>
          {title}
        </h3>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <ExplorerItem name="Marketing Assets 2024" selected />
        <ExplorerItem name="Q3 Financial Reports" />
        <ExplorerItem name="Design Mockups" />
        <ExplorerItem name="Client Projects - Archived" selected />
      </div>
    </div>
  );
}

function ExplorerItem({
  name,
  selected,
}: {
  name: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
        selected
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {selected ? "check_box" : "check_box_outline_blank"}
      </span>

      <span className="text-sm truncate">{name}</span>
    </div>
  );
}

function TransferOptions() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm w-64">
        <h4 className="text-xs font-bold uppercase mb-3">
          Transfer Options
        </h4>

        <div className="space-y-3 text-sm">
          <label className="flex gap-2">
            <input type="checkbox" />
            Delete source after transfer
          </label>

          <label className="flex gap-2">
            <input type="checkbox" defaultChecked />
            Preserve permissions
          </label>
        </div>

        <button className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg font-semibold">
          Start Transfer
        </button>
      </div>
    </div>
  );
}
