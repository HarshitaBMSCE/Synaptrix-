import { ArrowRight, Bot, Clock, FileImage, FileText, Globe, MapPinned, Mic, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { Badge, ButtonLink, Card, Logo } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#202124] selection:bg-[#F4511E]/10 selection:text-[#F4511E]">
      {/* Announcement Bar */}
      <div className="bg-[#202124] text-white py-2 px-4 text-center text-xs font-semibold tracking-wide">
        Built to help gig workers understand earnings, deductions and safety risks.
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-[#E7E7EA] bg-white/95 backdrop-blur-md transition-all duration-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#workflow" className="hover:text-primary transition-colors">How it works</Link>
            <Link href="#explainability" className="hover:text-primary transition-colors">Fairness Score</Link>
            <Link href="#safety" className="hover:text-primary transition-colors">Safety</Link>
            <Link href="#about" className="hover:text-primary transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-bold text-slate-700 hover:text-primary px-4 py-2 transition-colors">
              Sign in
            </Link>
            <ButtonLink href="/sign-up">
              Get started
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <div className="inline-flex">
              <Badge tone="green">Bengaluru Pilot Project</Badge>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#202124] sm:text-5xl lg:text-6xl leading-[1.1]">
              Know what your work is <span className="text-primary">really worth.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-xl">
              Log gig work, review deductions, compare estimated fair earnings and access safety tools from one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/sign-up">
                Get started <ArrowRight className="ml-2" size={18} />
              </ButtonLink>
              <ButtonLink href="/sign-in" variant="secondary">Sign in</ButtonLink>
            </div>
            <p className="mt-4 text-xs text-muted-foreground italic">
              * Independent estimates based on the information you provide. Not an official platform fare or legal determination.
            </p>
          </div>

          {/* Right Product Preview Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/10 to-transparent blur-2xl" />
            <div className="relative rounded-2xl border border-[#E7E7EA] bg-white p-6 shadow-xl max-w-lg mx-auto">
              <div className="flex items-center justify-between border-b border-[#E7E7EA] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-bold text-slate-400">Illustrative preview</span>
              </div>
              <div className="space-y-4">
                {/* Simulated Job Earnings widget */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Swiggy delivery</p>
                    <p className="text-2xl font-black mt-1">₹102.00</p>
                  </div>
                  <Badge tone="amber">Slightly underpaid</Badge>
                </div>
                {/* Simulated Score Details widget */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-slate-100 rounded-xl bg-white">
                    <p className="text-xs text-muted-foreground">Expected net</p>
                    <p className="text-lg font-bold">₹118.00</p>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-xl bg-white">
                    <p className="text-xs text-muted-foreground">Operating cost</p>
                    <p className="text-lg font-bold">₹25.48</p>
                  </div>
                </div>
                {/* Simulated Progress Metrics */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Fare fairness score</span>
                    <span className="text-amber-600">76/100</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: "76%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Section */}
      <section id="workflow" className="bg-white py-20 border-y border-[#E7E7EA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="green">How it works</Badge>
          <h2 className="mt-4 text-3xl font-extrabold text-[#202124] sm:text-4xl">
            From job record to clear explanation
          </h2>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Review fairness and understand your earnings in four simple steps.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {[
              { num: "01", title: "Add a job", desc: "Log gig platform details manually, upload payout screenshots, or speak a voice note." },
              { num: "02", title: "Review extraction", desc: "Audit and verify the extracted details parsed by our client-side models and AI tools." },
              { num: "03", title: "Check the fairness", desc: "Compare your net payout against deterministic Bengaluru benchmark assumptions." },
              { num: "04", title: "Save and resolve", desc: "Store evidence in your S3 vault or generate complaint drafts for underpaid jobs." }
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl border border-slate-100 bg-[#F7F7F8]">
                <span className="text-3xl font-black text-primary/30 leading-none">{step.num}</span>
                <h3 className="mt-4 font-bold text-lg text-[#202124]">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job-Entry Methods Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="neutral">Flexible Capture</Badge>
          <h2 className="mt-4 text-3xl font-extrabold text-[#202124] sm:text-4xl">
            Three ways to log your work
          </h2>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the capture method that fits your workflow. Note: AI extractions require manual review to ensure details are accurate.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3 text-left">
            <Card className="hover:translate-y-[-4px] transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-xl">Manual entry</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Log platform details, payouts, distances, active hours, and weather conditions directly into your form.
              </p>
            </Card>
            <Card className="hover:translate-y-[-4px] transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <FileImage size={24} />
              </div>
              <h3 className="font-bold text-xl">Screenshot scan</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Upload a payout screenshot to S3. Our integration parses key details for your confirmation.
              </p>
            </Card>
            <Card className="hover:translate-y-[-4px] transition-transform duration-300">
              <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6">
                <Mic size={24} />
              </div>
              <h3 className="font-bold text-xl">Voice entry</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Speak a simple voice transcript such as &quot;Ola ride, paid 120 rupees, 6 km&quot; to automatically generate the fields.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Overview Section */}
      <section id="features" className="bg-white py-20 border-t border-[#E7E7EA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="green">Comprehensive Protection</Badge>
          <h2 className="mt-4 text-3xl font-extrabold text-[#202124] sm:text-4xl">
            Features built for gig workers
          </h2>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to verify payouts, compare safety risks, and secure your rights.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {[
              { icon: ShieldCheck, title: "Fare fairness estimates", desc: "Compare net payouts against operating costs and minimum rate standards." },
              { icon: WalletCards, title: "Multi-platform earnings", desc: "Consolidate earnings from Swiggy, Zomato, Uber, Ola, and Blinkit in one place." },
              { icon: FileText, title: "Deduction tracking", desc: "Monitor explained and unexplained platform deductions to identify potential discrepancies." },
              { icon: Bot, title: "Worker-rights assistant", desc: "Ask rights-related questions based on curated India and Karnataka regulatory acts." },
              { icon: FileText, title: "Complaint drafting", desc: "Create formal, evidence-backed complaint drafts ready to be shared with platforms." },
              { icon: MapPinned, title: "Route safety guidance", desc: "Compare weather and incident hazard levels across multiple route alternatives." },
              { icon: Clock, title: "Fatigue reminders", desc: "Deterministic working hours monitoring to suggest safe break times." },
              { icon: WalletCards, title: "Savings goals", desc: "Set monthly goals with customized safe-percentage savings recommendation parameters." },
              { icon: Globe, title: "Anonymized benchmarks", desc: "Compare platform rates against community medians safely without exposing personal details." }
            ].map((feature, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <feature.icon size={20} />
                </div>
                <h3 className="mt-4 font-bold text-base text-[#202124]">{feature.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Explainability Section */}
      <section id="explainability" className="py-20 bg-[#F7F7F8] border-t border-[#E7E7EA]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge tone="amber">Explainable Scoring</Badge>
            <h2 className="mt-4 text-3xl font-extrabold text-[#202124]">How fairness is evaluated</h2>
          </div>
          <Card className="relative overflow-hidden">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6 text-sm text-[#202124] flex flex-wrap gap-2 items-center justify-between">
              <span><strong>Benchmark walkthrough:</strong> Swiggy Delivery (9 km)</span>
              <Badge tone="green">Illustration</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-600">Net payout received</span>
                <strong>₹102.00</strong>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-600">Estimated operating cost (9.1 km @ ₹2.80)</span>
                <span className="text-red-600">-₹25.48</span>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-600">Active working time (34 mins @ ₹140/hr floor)</span>
                <span className="text-emerald-600">+₹79.33</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2">
                <span>Expected net baseline</span>
                <span>₹104.81</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500 leading-relaxed">
              <strong>Disclaimer:</strong> GigShield provides an independent estimate based on the information and assumptions shown. Real scores are calculated deterministically via code. AI functions are used exclusively to extract screenshot text or parse voice transcripts.
            </p>
          </Card>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="bg-white py-20 border-t border-[#E7E7EA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="red">Safety First</Badge>
          <h2 className="mt-4 text-3xl font-extrabold text-[#202124] sm:text-4xl">
            Worker safety and alert tools
          </h2>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Access route-risk details, record unsafe situations, and prepare emergency sharing options.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3 text-left">
            <Card>
              <h3 className="font-bold text-lg">Route risk guidance</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Compare multiple route options based on incident histories, street light density, and localized weather hazards.
              </p>
            </Card>
            <Card>
              <h3 className="font-bold text-lg">Fatigue tracking</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Monitor uninterrupted active hours and receive notifications suggesting rest breaks when boundaries are exceeded.
              </p>
            </Card>
            <Card>
              <h3 className="font-bold text-lg">Trusted-contact share</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Draft emergency check-in countdowns and copy route details to share with friends.
              </p>
            </Card>
          </div>
          <div className="mt-8 max-w-md mx-auto p-4 rounded-xl border border-amber-100 bg-amber-50/50 text-xs text-amber-800 leading-relaxed">
            <strong>Important Safety Notice:</strong> Safety guidance is informational and cannot guarantee that a route or situation is safe.
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-[#F7F7F8] border-t border-[#E7E7EA]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge tone="green">Anonymized community data</Badge>
          <h2 className="mt-4 text-3xl font-extrabold text-[#202124]">Benchmarked together</h2>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            GigShield benchmarks are built collectively. Anonymized data records platforms, zones, distance brackets, duration brackets, and time bands. No names, phone numbers, screenshots, exact coordinates, or notes are shared, preserving worker privacy.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white py-20 border-t border-[#E7E7EA]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-[#202124] sm:text-4xl">
            Start understanding your gig work
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
            Log your first delivery or ride to check whether deductions and net payouts align with fair expectations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/sign-up">
              Create account
            </ButtonLink>
            <ButtonLink href="/sign-in" variant="secondary">Sign in</ButtonLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-[#202124] text-slate-400 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5.5 w-5.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-white">GigShield</p>
            <p className="mt-2 text-xs leading-relaxed max-w-sm">
              Fair pay. Safer routes. Stronger workers. Built to empower Bengaluru’s delivery and transportation professionals.
            </p>
          </div>
          <div className="text-left">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#features" className="hover:text-white">Features</Link></li>
              <li><Link href="#workflow" className="hover:text-white">How it works</Link></li>
              <li><Link href="/sign-up" className="hover:text-white">Create account</Link></li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Safety & Privacy</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#safety" className="hover:text-white">Safety notice</Link></li>
              <li><span className="text-slate-500">Privacy policy</span></li>
              <li><span className="text-slate-500">Terms of service</span></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 text-center text-xs">
          <p>© {new Date().getFullYear()} GigShield. All rights reserved. This is an independent project and is not affiliated with, endorsed by, or sponsored by any gig economy platforms.</p>
        </div>
      </footer>
    </div>
  );
}
