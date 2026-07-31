import { ButtonLink, Card, Logo } from "@/components/ui";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F7F8] px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        
        <Card className="text-left space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-extrabold text-[#202124]">Access Denied</h1>
          </div>
          
          <p className="text-sm text-slate-500 leading-relaxed">
            This workspace requires administrative credentials. Your current account role does not have authorization to view this resource.
          </p>
          
          <div className="pt-4 flex gap-2">
            <ButtonLink href="/dashboard" className="w-full">
              Return to dashboard
            </ButtonLink>
          </div>
        </Card>
      </div>
    </main>
  );
}
