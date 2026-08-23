export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-700 font-bold tracking-[-0.02em] text-fg-default">{title}</h1>
        {subtitle && <p className="mt-1 text-200 text-fg-subtle">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
