import { DemoRoleSwitcher } from "@/components/demo-role-switcher";
import { isDemoMode } from "@/lib/auth";

export default function DemoPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <DemoRoleSwitcher enabled={isDemoMode()} />
    </main>
  );
}
