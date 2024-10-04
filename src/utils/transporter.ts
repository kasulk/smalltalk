import nodemailer from "nodemailer";

const { EMAIL_SENDER, EMAIL_SENDER_PASSWORD, EMAIL_SENDER_HOST } = process.env;

if (!EMAIL_SENDER) throw new Error("No EMAIL_SENDER provided!");
if (!EMAIL_SENDER_HOST) throw new Error("No EMAIL_SENDER_HOST provided!");
if (!EMAIL_SENDER_PASSWORD)
  throw new Error("No EMAIL_SENDER_PASSWORD provided!");

// configuration of SMTP-Transporter
export const transporter = nodemailer.createTransport({
  host: EMAIL_SENDER_HOST,
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: EMAIL_SENDER,
    pass: EMAIL_SENDER_PASSWORD,
  },
});
