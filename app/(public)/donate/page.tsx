import { HeartHandshakeIcon } from "lucide-react";

import { DuitNowQrCard } from "@/components/donation/duitnow-qr-card";
import { StripeDonationForm } from "@/components/donation/stripe-donation-form";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";

export default function DonatePage() {
  const stripePublishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.STRIPE_PUBLISHABLE_KEY ?? "";

  return (
    <main className="min-h-svh bg-muted/25 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <PageBreadcrumb items={[]} current="Sokong MARC" />
        <header className="grid gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HeartHandshakeIcon className="size-6" />
          </div>
          <p className="text-sm font-medium text-primary">Sokong MARC</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Bantu MARC terus berjalan
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Sumbangan anda membantu menampung kos hosting, domain dan masa penyelenggaraan MARC.
          </p>
        </header>
        <div className="w-full max-w-2xl">
          <div className="grid gap-6">
            <StripeDonationForm publishableKey={stripePublishableKey} />
            <DuitNowQrCard />
          </div>
        </div>
      </div>
    </main>
  );
}
