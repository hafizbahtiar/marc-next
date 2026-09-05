export function TajukAuth({
  tajuk,
  perihal,
}: {
  tajuk: string;
  perihal: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      <h1 className="font-heading text-[1.75rem] font-semibold tracking-tight text-balance">{tajuk}</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
        {perihal}
      </p>
    </header>
  );
}
