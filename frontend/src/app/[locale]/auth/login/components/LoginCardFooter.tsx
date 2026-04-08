export function LoginCardFooter() {
  return (
    <div className="border-t border-outline-variant/10 bg-surface-container-low/50 px-10 py-6 text-center">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        © {new Date().getFullYear()}
      </p>
    </div>
  );
}
