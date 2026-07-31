import { SignUp } from "@clerk/nextjs";
import { Card, Logo } from "@/components/ui";
import Link from "next/link";

export default function SignUpPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F7F8] px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Card className="text-left">
          <h1 className="text-2xl font-extrabold text-[#202124]">Create your profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            Set up your private workspace to track metrics and routes.
          </p>
          <div className="mt-6">
            {clerkConfigured ? (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/onboarding"
                forceRedirectUrl="/onboarding"
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-[#D84315] text-sm font-semibold rounded-xl min-h-11",
                    card: "border-0 shadow-none p-0 bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden"
                  }
                }}
              />
            ) : (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 leading-relaxed">
                Clerk authentication is not configured. Please add your credentials in <code>.env.local</code>.
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
