import { transporter } from "@/utils";

const { EMAIL_SENDER } = process.env;

if (!EMAIL_SENDER) throw new Error("No EMAIL_SENDER provided!");

export async function sendEmail(
  to: string = EMAIL_SENDER!,
  text: string,
  subject: string = text.length > 20 ? text.slice(20) : text + "...",
  html?: string
): Promise<void> {
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
