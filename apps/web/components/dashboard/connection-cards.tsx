'use client';
import { useMe } from "@/hooks/useMe";
import Image from "next/image";
import { MouseEventHandler } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
function ConnectionCards() {
  const { data } = useMe();
  if (!data) return null;
  const handleAddDestination = () => {
    window.location.href = `${API_URL}/auth/google?intent=destination`;
  };
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
      <AccountCard
        isSource={true}
        profile={{
          title: data.sourceAccount?.name,
          email: data.sourceAccount?.email,
          name: data.sourceAccount?.name,
          picture: data.sourceAccount?.avatarUrl
        }}
      />
      <div className="flex justify-center text-slate-300 dark:text-slate-600">
        <span className="material-symbols-outlined !text-3xl md:rotate-0 rotate-90">
          arrow_forward
        </span>
      </div>
      <AccountCard
        isNew={!data.destinationAccount}
        profile={{
          title: data.destinationAccount?.name,
          email: data.destinationAccount?.email,
          name: data.destinationAccount?.name,
          picture: data.destinationAccount?.avatarUrl
        }}
        onChange={handleAddDestination}
      />
    </section>
  );
}

export default ConnectionCards;

const AccountCard = ({
  isSource = false,
  isNew,
  profile, onChange
}: {
  isSource?: boolean
  isNew?: boolean;
  profile?: {
    title: string | null | undefined;
    email: string | null | undefined;
    name: string | null | undefined;
    picture: string | null | undefined;

  } | null;
  onChange?: MouseEventHandler<HTMLButtonElement>
}) => {
  if (isNew)
    return (
      <button className="w-full group focus:outline-none cursor-pointer" onClick={onChange}>
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
              {profile?.picture ? (
                <Image
                  height={48}
                  width={48}
                  alt={`${profile.name} Avatar`}
                  className="w-full h-full object-cover"
                  src={profile.picture}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="material-symbols-outlined text-slate-400">
                    person
                  </span>
                </div>
              )}
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
        {!isSource && <button 
        className="text-sm font-medium text-slate-600 dark:text-slate-300 
        hover:text-primary dark:hover:text-primary px-3 py-1.5 rounded-lg
         hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"onClick={onChange}>
          Change
        </button>}
      </div>
    );
};
