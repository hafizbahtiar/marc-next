import { TelegramPanel } from "@/components/settings/telegram-panel";
import { PageBreadcrumb } from "@/components/marc/page-breadcrumb";
import { wajibSesi } from "@/lib/auth/session";

export default async function TelegramPage() {
  const { profile } = await wajibSesi();

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageBreadcrumb items={[{ href: "/settings", label: "Tetapan" }]} current="Telegram" />
      <header className="grid gap-2">
        <p className="text-sm font-medium text-primary">Sambungan</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Telegram</h1>
      </header>
      <TelegramPanel linked={profile.telegram_linked} username={profile.telegram_username} />
    </div>
  );
}
