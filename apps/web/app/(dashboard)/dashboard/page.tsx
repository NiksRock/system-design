import DashboardHeader from "@/components/dashboard/dashboard-header";
import ConnectionCards from "@/components/dashboard/connection-cards";
import ExplorerLayout from "@/components/dashboard/explorer-layout";
import BottomTransferPanel from "@/components/dashboard/bottom-transfer-panel";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <DashboardHeader />

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        <ConnectionCards />
        <ExplorerLayout />
      </main>

      <BottomTransferPanel />
    </div>
  );
}
