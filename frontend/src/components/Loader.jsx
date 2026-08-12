const Loader = ({ label = "Loading" }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/60">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-ink/15 border-t-teal" />
    <span className="font-mono text-xs uppercase tracking-widest">{label}</span>
  </div>
);

export default Loader;
