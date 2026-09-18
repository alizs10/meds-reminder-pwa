import { type ReactNode, useEffect, useState } from "react";
import BottomBar from "./BottomBar";
import CustomHeader from "./CustomHeader";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useMedicineStore } from "@/stores/useMedicineStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { useLogStore } from "@/stores/useLogStore";
import { useHeader } from "@/hooks/useHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const initializeProfile = useProfileStore((s) => s.initialize);
  const initializeMedicines = useMedicineStore((s) => s.initialize);
  const initializeLogs = useLogStore((s) => s.initialize);

  const { header } = useHeader();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Settings are now handled synchronously via localStorage, so we only need to init DB data
    Promise.all([
      initializeProfile(),
      initializeMedicines(),
      initializeLogs(),
    ]).catch((error) =>
      console.error("Failed to initialize stores:", error)
    );
  }, [initializeProfile, initializeMedicines, initializeLogs]);

  return (
    <div className="pt-safe w-full h-full min-h-0 flex flex-col">
      {header ? <CustomHeader header={header} /> : <Header />}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 min-h-0">
        {children}
      </main>

      <BottomBar onMenuClick={() => setIsSidebarOpen(true)} />
    </div>
  );
}