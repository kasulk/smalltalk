import nodemailer from "nodemailer";

const { EMAIL_SENDER, EMAIL_SENDER_PASSWORD, EMAIL_SENDER_HOST } = process.env;

if (!EMAIL_SENDER) throw new Error("No EMAIL_SENDER provided!");
if (!EMAIL_SENDER_HOST) throw new Error("No EMAIL_SENDER_HOST provided!");
if (!EMAIL_SENDER_PASSWORD)
  throw new Error("No EMAIL_SENDER_PASSWORD provided!");

export async function sendEmail(
  to: string = EMAIL_SENDER!,
  text: string,
  subject: string = text.length > 20 ? text.slice(20) : text + "...",
  html?: string
): Promise<void> {
  // configuration of SMTP-Transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_SENDER_HOST,
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: EMAIL_SENDER,
      pass: EMAIL_SENDER_PASSWORD,
    },
  });

  // send E-Mail
  const info = await transporter.sendMail({
    from: EMAIL_SENDER, // e.g. '"Your Name" <your-email@gmail.com>'
    to,
    subject,
    text,
    html,
  });

  console.log(`Message sent: ${info.messageId}`);
}
