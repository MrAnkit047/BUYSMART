const Rating = ({ value = 0, count, size = "text-sm" }) => {
  return (
    <div className={`flex items-center gap-1 ${size}`}>
      <div className="flex text-accent">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {value >= star ? "★" : value >= star - 0.5 ? "⯨" : "☆"}
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className="font-mono text-xs text-ink/50">({count})</span>
      )}
    </div>
  );
};

export default Rating;
