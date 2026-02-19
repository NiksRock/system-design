import Image from "next/image";

function ConnectionCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
      <AccountCard
        profile={{
          title: "Source Account",
          email: "source@example.com",
          name: "John Doe",
          picture:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBTGjy5o4lf7MOKu-Og0UJAlg4RZkQ4lIX1e3W4iVzPriAe_HVJVDmDZa4cFcHQSwv8W6h2fsPXiC26gPgODf6eUjGW-wg73d4OeWqR1vL2w36L1N2VTyHCGVwRl8TjTr4UFajt-31HwW26RxZfZUoa9vhqZc4yQaplZ3Qy3MWbjV_t5ilsWXZJBzqGMksbtMBr9RJ8CwzNBI5Qii8Eqh6aDnStFX93KVYXzMKnyQ5utd_AEEzsFmjumK7WPI8Eb7L4aiIsadIavqeK",
        }}
      />
      <div className="flex justify-center text-slate-300 dark:text-slate-600">
        <span className="material-symbols-outlined !text-3xl md:rotate-0 rotate-90">
          arrow_forward
        </span>
      </div>
      <AccountCard isNew />
    </section>
  );
}

export default ConnectionCards;

const AccountCard = ({
  isNew,
  profile,
}: {
  isNew?: boolean;
  profile?: {
    title: string;
    email: string;
    name: string;
    picture: string;
    onChange?: () => void;
  } | null;
}) => {
  if (isNew)
    return (
      <button className="w-full group focus:outline-none cursor-pointer">
        <div
          className="relative bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200
         dark:border-gray-700 rounded-2xl p-5 flex items-center shadow-sm transition-all 
         duration-200 group-hover:border-primary group-hover:shadow-md group-hover:bg-blue-50/30
          dark:group-hover:bg-blue-900/10"
        >
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white text-gray-400 dark:text-gray-500">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
          </div>

          <div className="ml-5 text-left flex-grow">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
              Add Account
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Connect another Google Drive account
            </p>
          </div>
          <div className="ml-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined">chevron_right</span>
          </div>
        </div>
      </button>
    );
  else
    return (
      <div
        className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 
      shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-600">
              <Image
                height={100}
                width={100}
                alt={`${profile?.name || "Unknown"} Avatar`}
                className="w-full h-full object-cover"
                data-alt={`${profile?.name || "Unknown"} Avatar`}
                src={profile?.picture || ""}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
              <span className="material-symbols-outlined text-green-500 !text-[18px]">
                check_circle
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
              {profile?.title}
            </p>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
              {profile?.email}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {profile?.name}
            </p>
          </div>
        </div>
        <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Change
        </button>
      </div>
    );
};
