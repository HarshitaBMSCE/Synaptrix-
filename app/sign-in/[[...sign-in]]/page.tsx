import { SignIn } from "@clerk/nextjs";
import { Card, Logo } from "@/components/ui";
import Link from "next/link";

export default function SignInPage() {
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
          <h1 className="text-2xl font-extrabold text-[#202124]">Sign in to GigShield</h1>
          <p className="mt-2 text-sm text-slate-500">
            Access your secure worker dashboard and verify your earnings.
          </p>
          <div className="mt-6">
            {clerkConfigured ? (
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full shadow-none border-0 p-0 m-0",
                    card: "w-full shadow-none border-0 bg-transparent p-0 m-0",
                    main: "w-full p-0 m-0",
                    header: "hidden",
                    footer: "bg-transparent border-0 mt-4",
                    formButtonPrimary: "bg-primary hover:bg-[#D84315] text-sm font-semibold rounded-xl min-h-11 w-full"
                  }
                }}
              />
            ) : (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 leading-relaxed">
                Clerk keys are required in <code>.env.local</code> before sign-in can run.
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
