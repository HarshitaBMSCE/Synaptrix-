import { SignIn } from "@clerk/nextjs";
import { ButtonLink, Card } from "@/components/ui";

export default function SignInPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Sign in to GigShield</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use Clerk authentication when configured, or open the seeded judge demo.</p>
        <div className="mt-6">
          {clerkConfigured ? <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" /> : <ButtonLink href="/dashboard">Continue in demo mode</ButtonLink>}
        </div>
      </Card>
    </main>
  );
}
