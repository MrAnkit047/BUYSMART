// Signature component: a clipped-corner "smart tag" badge used for
// discount percentages and stock/status callouts across the site.
const PriceTag = ({ children, tone = "accent" }) => {
  const tones = {
    accent: "bg-accent text-inkdark",
    teal: "bg-teal text-white",
    ink: "bg-ink text-white",
    muted: "bg-ink/10 text-ink/70",
  };
  return (
    <span
      className={`smart-tag smart-tag-hole inline-flex items-center py-1 pr-2.5 text-[11px] font-mono font-semibold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

export default PriceTag;
