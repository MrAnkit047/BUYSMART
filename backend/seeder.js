import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import products from "./data/products.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@buysmart.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    await User.create({
      name: process.env.ADMIN_NAME || "Store Administrator",
      email: adminEmail,
      password: adminPassword,
      isAdmin: true,
    });
    console.log(`Admin account created for ${adminEmail}`);

    const demoCustomer = await User.create({
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      phone: "9841234567",
      password: "password123",
      customerId: "BS-CUST-882190",
      address: {
        fullName: "Jane Doe",
        line1: "Lazimpat, Ward 2",
        line2: "Near Embassy of Japan",
        city: "Kathmandu",
        state: "Bagmati",
        postalCode: "44600",
        country: "Nepal",
        phone: "9841234567",
      },
    });

    const createdProducts = await Promise.all(
      products.map((product) => Product.create(product))
    );

    // Create sample orders for demo customer
    if (createdProducts.length >= 3) {
      await Order.create({
        customerId: demoCustomer.customerId,
        user: demoCustomer._id,
        orderItems: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            image: createdProducts[0].image,
            price: createdProducts[0].discountPrice || createdProducts[0].price,
            qty: 1,
          },
          {
            product: createdProducts[1]._id,
            name: createdProducts[1].name,
            image: createdProducts[1].image,
            price: createdProducts[1].discountPrice || createdProducts[1].price,
            qty: 2,
          },
        ],
        shippingAddress: demoCustomer.address,
        paymentMethod: "Cash on Delivery",
        itemsPrice: 31997,
        shippingPrice: 0,
        taxPrice: 4160,
        totalPrice: 36157,
        status: "Delivered",
        isPaid: true,
        paidAt: Date.now() - 86400000 * 3,
        isDelivered: true,
        deliveredAt: Date.now() - 86400000 * 2,
      });

      await Order.create({
        customerId: demoCustomer.customerId,
        user: demoCustomer._id,
        orderItems: [
          {
            product: createdProducts[4]._id,
            name: createdProducts[4].name,
            image: createdProducts[4].image,
            price: createdProducts[4].price,
            qty: 2,
          },
        ],
        shippingAddress: demoCustomer.address,
        paymentMethod: "Cash on Delivery",
        itemsPrice: 2900,
        shippingPrice: 150,
        taxPrice: 377,
        totalPrice: 3427,
        status: "Processing",
        isPaid: false,
      });
    }

    console.log(`Imported ${products.length} products with NPR pricing.`);
    console.log("Database successfully seeded with demo catalog & accounts.");
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log("Data destroyed!");
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
