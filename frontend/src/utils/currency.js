export const formatNPR = (amount) => {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const formatPrice = formatNPR;
