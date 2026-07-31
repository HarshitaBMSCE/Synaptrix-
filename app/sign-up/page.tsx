import { SignUp } from "@clerk/nextjs";
import { ButtonLink, Card } from "@/components/ui";

export default function SignUpPage() {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Create your GigShield profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Authentication is server-verified through Clerk when keys are present.</p>
        <div className="mt-6">
          {clerkConfigured ? <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" /> : <ButtonLink href="/onboarding">Continue in demo mode</ButtonLink>}
        </div>
      </Card>
    </main>
  );
}
