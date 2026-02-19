export default function ConnectionCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
      <ConnectionCard
        title="Source Account"
        email="john.doe@gmail.com"
        subtitle="15GB / 100GB used"
      />

      <div className="flex justify-center text-slate-300 dark:text-slate-600">
        <span className="material-symbols-outlined text-3xl">
          arrow_forward
        </span>
      </div>

      <ConnectionCard
        title="Destination Account"
        email="john.work@company.com"
        subtitle="Unlimited Storage"
      />
    </section>
  );
}

function ConnectionCard({
  title,
  email,
  subtitle,
}: {
  title: string;
  email: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {title}
        </p>
        <h3 className="font-bold">{email}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </p>
      </div>

      <button className="text-sm font-medium text-muted-foreground hover:text-primary">
        Change
      </button>
    </div>
  );
}
