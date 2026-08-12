import User from "../models/User.js";

const generateCustomerId = async () => {
  const year = new Date().getFullYear();
  const count = await User.countDocuments({ customerId: { $exists: true, $ne: null } });
  return `BS-${year}-${String(count + 1).padStart(5, "0")}`;
};

export default generateCustomerId;
