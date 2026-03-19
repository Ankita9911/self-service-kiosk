import nodemailer from "nodemailer";
import env from "../../config/env.js";
import { getWelcomeEmailTemplate } from "./templates/welcomeEmail.template.js";
import { getPasswordResetTemplate } from "./templates/passwordReset.template.js";
import { getPasswordChangedTemplate } from "./templates/passwordChanged.template.js";

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return _transporter;
}

async function sendMail({ to, cc, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[Email] SMTP not configured — skipping email to ${to}`);
    return;
  }

  try {
    const mailOptions = {
      from: env.SMTP_FROM || `"HyperHub Kitchen" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    // Add CC if provided
    if (cc) {
      mailOptions.cc = cc;
    }

    await transporter.sendMail(mailOptions);
    console.info(
      `[Email] Sent "${subject}" → ${to}${cc ? ` (cc: ${cc})` : ""}`,
    );
  } catch (err) {
    // Fire-and-forget: never crash the main request
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
}

export async function sendWelcomeEmail({ name, email, tempPassword, role }) {
  const roleLabel = role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const appName = "HyperHub Kitchen";
  const html = getWelcomeEmailTemplate({
    appName,
    name,
    roleLabel,
    tempPassword,
    email,
  });

  await sendMail({
    to: email,
    subject: `Welcome to ${appName} — Your temporary password`,
    html,
  });
}

export async function sendPasswordResetEmail({ name, email, tempPassword }) {
  const appName = "HyperHub Kitchen";
  const html = getPasswordResetTemplate({ appName, name, tempPassword });

  await sendMail({
    to: email,
    subject: `${appName} — Your password has been reset`,
    html,
  });
}

export async function sendPasswordChangedEmail({ name, email }) {
  const appName = "HyperHub Kitchen";
  const html = getPasswordChangedTemplate({ appName, name, email });

  await sendMail({
    to: email,
    subject: `${appName} — Your password has been changed`,
    html,
  });
}

export async function sendLowStockAlert({
  to,
  cc,
  ingredientName,
  currentStock,
  minThreshold,
  unit,
  outletName,
  franchiseName,
}) {
  const { getLowStockAlertTemplate } =
    await import("./templates/lowStockAlert.template.js");

  const appName = "HyperHub Kitchen";
  const html = getLowStockAlertTemplate({
    ingredientName,
    currentStock,
    minThreshold,
    unit,
    outletName,
    franchiseName,
  });

  await sendMail({
    to,
    cc,
    subject: `${appName} — Low Stock Alert: ${ingredientName}`,
    html,
  });
}
