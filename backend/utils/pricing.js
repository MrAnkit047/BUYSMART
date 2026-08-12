// Nepal Rupee pricing rules used across checkout and order creation
export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 150;
export const VAT_RATE = 0.13;

export const calcOrderPricing = (itemsPrice) => {
  const shippingPrice =
    itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : itemsPrice > 0 ? SHIPPING_FEE : 0;
  const taxPrice = Number((VAT_RATE * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));
  return { shippingPrice, taxPrice, totalPrice };
};
