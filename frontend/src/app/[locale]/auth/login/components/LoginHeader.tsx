const DomainIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5 text-white"
  >
    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm-1 4h20v6H2v-6zm2 2v2h16v-2H4z" />
  </svg>
);

export function LoginHeader() {
  return (
    <header className="fixed left-0 top-0 z-50 flex w-full items-center justify-between px-8 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <DomainIcon />
        </div>
        <span className="font-headline text-xl font-extrabold tracking-tight text-primary">
          Sovereign Workspace
        </span>
      </div>
      <nav>
        <a
          href="#"
          className="text-sm font-medium uppercase tracking-wider text-primary transition-colors hover:text-surface-tint"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
