const variants = {
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-teal/10 text-teal border-teal/30",
  info: "bg-ink50 text-ink border-ink/10",
};

const Message = ({ type = "info", children }) => (
  <div className={`rounded-lg border px-4 py-3 text-sm ${variants[type]}`}>
    {children}
  </div>
);

export default Message;
