export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="size-8 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">
            cloud_sync
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          GDriveBridge
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
            System Operational
          </span>
        </div>

        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined text-[20px]">
            dark_mode
          </span>
        </button>

        <button className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="text-sm font-medium hidden sm:block">
            Admin User
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              person
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
