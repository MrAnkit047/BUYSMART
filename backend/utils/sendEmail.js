import nodemailer from "nodemailer";

/**
 * Helper to create Nodemailer transporter
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send order confirmation email to the customer's Gmail ID
 * @param {Object} params
 * @param {Object} params.order - The created order object
 * @param {Object} params.user - The user object (contains email and name)
 */
export const sendOrderConfirmationEmail = async ({ order, user }) => {
  const customerEmail = user?.email;
  const customerName = user?.name || order?.shippingAddress?.fullName || "Valued Customer";

  if (!customerEmail) {
    console.warn("⚠️ Cannot send order confirmation email: Customer email is missing.");
    return false;
  }

  const orderId = order.orderNumber || `#${order._id}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Build items rows HTML
  const itemsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #4b5563; text-align: center;">
          ${item.qty}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #4b5563; text-align: right;">
          Rs. ${item.price.toLocaleString("en-IN")}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">
          Rs. ${(item.price * item.qty).toLocaleString("en-IN")}
        </td>
      </tr>
    `
    )
    .join("");

  const shippingAddr = order.shippingAddress
    ? `
      <p style="margin: 4px 0; color: #374151;"><strong>${order.shippingAddress.fullName || customerName}</strong></p>
      <p style="margin: 4px 0; color: #4b5563;">${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}</p>
      <p style="margin: 4px 0; color: #4b5563;">${order.shippingAddress.city}${order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} ${order.shippingAddress.postalCode || ""}</p>
      <p style="margin: 4px 0; color: #4b5563;">${order.shippingAddress.country || ""}</p>
      ${order.shippingAddress.phone ? `<p style="margin: 4px 0; color: #4b5563;">📞 ${order.shippingAddress.phone}</p>` : ""}
    `
    : '<p style="margin: 4px 0; color: #6b7280;">N/A</p>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - BuySmart</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BuySmart</h1>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Thank you for your order!</p>
        </div>

        <!-- Content Body -->
        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Hi <strong>${customerName}</strong>,</p>
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            We have received your order <strong>${orderId}</strong> placed on <span>${orderDate}</span>. We're getting it ready for delivery!
          </p>

          <!-- Order Summary Card -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
              <span style="color: #6b7280;">Order Number:</span>
              <span style="font-weight: 700; color: #2563eb;">${orderId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px;">
              <span style="color: #6b7280;">Payment Method:</span>
              <span style="font-weight: 600; color: #111827;">${order.paymentMethod || "Cash on Delivery"}</span>
            </div>
          </div>

          <!-- Items Table -->
          <h3 style="font-size: 16px; color: #111827; margin-bottom: 12px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f3f4f6; text-align: left;">
                <th style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #6b7280;">Item</th>
                <th style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #6b7280; text-align: center;">Qty</th>
                <th style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #6b7280; text-align: right;">Price</th>
                <th style="padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #6b7280; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals Breakdown -->
          <div style="width: 100%; margin-bottom: 32px;">
            <table style="width: 250px; margin-left: auto; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Subtotal:</td>
                <td style="padding: 6px 0; text-align: right; color: #1f2937; font-size: 14px; font-weight: 500;">Rs. ${(order.itemsPrice || 0).toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Tax:</td>
                <td style="padding: 6px 0; text-align: right; color: #1f2937; font-size: 14px; font-weight: 500;">Rs. ${(order.taxPrice || 0).toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Shipping:</td>
                <td style="padding: 6px 0; text-align: right; color: #1f2937; font-size: 14px; font-weight: 500;">
                  ${order.shippingPrice === 0 ? '<span style="color: #16a34a; font-weight: 600;">FREE</span>' : `Rs. ${order.shippingPrice.toLocaleString("en-IN")}`}
                </td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: 700;">Grand Total:</td>
                <td style="padding: 12px 0 0 0; text-align: right; color: #2563eb; font-size: 18px; font-weight: 800;">Rs. ${(order.totalPrice || 0).toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px 20px; border-left: 4px solid #2563eb;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px;">Shipping Destination</h4>
            ${shippingAddr}
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 13px; color: #9ca3af;">
          <p style="margin: 0 0 4px 0;">If you have any questions, feel free to contact our support team.</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} BuySmart. All rights reserved.</p>
        </div>

      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`📧 [ORDER EMAIL NOTIFICATION LOG]`);
    console.log(`To: ${customerEmail}`);
    console.log(`Subject: 🛒 Order Confirmation - ${orderId} | BuySmart`);
    console.log(`Order Total: Rs. ${(order.totalPrice || 0).toLocaleString("en-IN")}`);
    console.log(`(Note: SMTP credentials not configured in backend/.env. Email simulation logged successfully.)`);
    console.log(`======================================================\n`);
    return true;
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || `"BuySmart Store" <${process.env.SMTP_USER}>`;
    const mailOptions = {
      from: fromAddress,
      to: customerEmail,
      subject: `🛒 Order Confirmation - ${orderId} | BuySmart`,
      html: htmlContent,
    };

    // Send a copy (BCC) to the store email if customer email is different
    if (process.env.SMTP_USER && customerEmail.toLowerCase() !== process.env.SMTP_USER.toLowerCase()) {
      mailOptions.bcc = process.env.SMTP_USER;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Order confirmation email sent to ${customerEmail} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send order confirmation email to ${customerEmail}:`, error.message);
    // Don't throw error to avoid failing the order creation process
    return false;
  }
};

/**
 * Send 6-digit Login Verification Code to user's Gmail ID
 * @param {Object} params
 * @param {Object} params.user - User document / object
 * @param {string} params.code - 6-digit verification code
 */
export const sendLoginOtpEmail = async ({ user, code }) => {
  const customerEmail = user?.email;
  const customerName = user?.name || "Customer";

  if (!customerEmail) {
    console.warn("⚠️ Cannot send login OTP: Customer email is missing.");
    return false;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Verification Code - BuySmart</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 520px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0d9488 0%, #115e59 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">BuySmart</h1>
          <p style="margin: 0; font-size: 15px; opacity: 0.95;">Account Login Verification</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <p style="font-size: 15px; color: #1f2937; margin-top: 0;">Hello <strong>${customerName}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            A login attempt was initiated for your BuySmart account. Please use the 6-digit verification code below to complete your sign-in:
          </p>

          <!-- OTP Box -->
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background-color: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 16px 36px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f766e;">
                ${code}
              </span>
            </div>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">Valid for <strong>10 minutes</strong></p>
          </div>

          <!-- Notice -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e;">
            🔒 <strong>Security Tip:</strong> Never share this code with anyone. BuySmart support will never ask for your verification code.
          </div>

          <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">
            If you did not initiate this login request, we recommend changing your password immediately.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} BuySmart Nepal. All rights reserved.
        </div>

      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`🔐 [GMAIL LOGIN VERIFICATION CODE]`);
    console.log(`To: ${customerEmail}`);
    console.log(`🔑 Verification Code: [ ${code} ]`);
    console.log(`Expires in: 10 minutes`);
    console.log(`(Note: SMTP not configured. Use the code above to log in.)`);
    console.log(`======================================================\n`);
    return true;
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || `"BuySmart Security" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: customerEmail,
      subject: `🔐 ${code} is your BuySmart login verification code`,
      html: htmlContent,
    });
    console.log(`✅ Login verification code sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send login verification email to ${customerEmail}:`, error.message);
    return false;
  }
};

/**
 * Send 6-digit Password Reset Code to user's Gmail ID
 * @param {Object} params
 * @param {Object} params.user - User document / object
 * @param {string} params.code - 6-digit reset code
 */
export const sendPasswordResetOtpEmail = async ({ user, code }) => {
  const customerEmail = user?.email;
  const customerName = user?.name || "Customer";

  if (!customerEmail) {
    console.warn("⚠️ Cannot send password reset OTP: Customer email is missing.");
    return false;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your BuySmart Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 520px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">BuySmart</h1>
          <p style="margin: 0; font-size: 15px; opacity: 0.95;">Password Reset Request</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <p style="font-size: 15px; color: #1f2937; margin-top: 0;">Hello <strong>${customerName}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            We received a request to reset the password for your BuySmart account. Enter the following 6-digit code on the reset page:
          </p>

          <!-- OTP Box -->
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 16px 36px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8;">
                ${code}
              </span>
            </div>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">Valid for <strong>10 minutes</strong></p>
          </div>

          <!-- Notice -->
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #991b1b;">
            ⚠️ If you did not ask to reset your password, please ignore this email or contact support if you suspect unauthorized access.
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} BuySmart Nepal. All rights reserved.
        </div>

      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`🔑 [GMAIL FORGOT PASSWORD RESET CODE]`);
    console.log(`To: ${customerEmail}`);
    console.log(`🔐 Reset Code: [ ${code} ]`);
    console.log(`Expires in: 10 minutes`);
    console.log(`(Note: SMTP not configured. Use the code above to reset.)`);
    console.log(`======================================================\n`);
    return true;
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || `"BuySmart Security" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: customerEmail,
      subject: `🔑 ${code} is your BuySmart password reset code`,
      html: htmlContent,
    });
    console.log(`✅ Password reset verification code sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${customerEmail}:`, error.message);
    return false;
  }
};
