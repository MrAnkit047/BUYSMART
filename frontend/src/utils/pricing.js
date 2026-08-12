export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 150;
export const VAT_RATE = 0.13;

export const calcOrderPricing = (itemsPrice) => {
  const shippingPrice =
    itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : itemsPrice > 0 ? SHIPPING_FEE : 0;
  const taxPrice = Math.round(VAT_RATE * itemsPrice);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  return {
    shipping: shippingPrice,
    tax: taxPrice,
    total: totalPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};
