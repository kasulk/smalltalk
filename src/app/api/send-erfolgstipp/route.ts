import { NextResponse, NextRequest } from "next/server";
import { MongoClient } from "mongodb";
import { marked } from "marked";
import { apiAuthCheck, removeLeadingZeros } from "../utils";
import { transporter } from "@/utils";

const { MONGODB_URI, EMAIL_SENDER, CRON_USERNAME, CRON_SECRET, NODE_ENV } =
  process.env;

const isDevMode = NODE_ENV === "development";

if (!MONGODB_URI) throw new Error("No MONGODB_URI provided!");
if (!CRON_USERNAME) throw new Error("No CRON_USERNAME provided!");
if (!CRON_SECRET) throw new Error("No CRON_SECRET provided!");

// MongoDB connection
const client = new MongoClient(MONGODB_URI);

export async function GET(request: NextRequest) {
  // auth-check (only in production)
  if (!isDevMode) apiAuthCheck(request, process.env);

  try {
    await client.connect();
    const db = client.db("erfolgstipps");
    const tips = db.collection("tips");

    const today = new Date();

    const randomDocument = await tips
      .aggregate([{ $sample: { size: 1 } }]) // $sample ist Aggregation-Operator, der size-viele zufällige Dokumente zurückgibt
      .toArray();

    const tip = randomDocument[0];

    const subscribers = await db.collection("subscribers").find().toArray();

    if (!tip) {
      return NextResponse.json(
        { message: "Keinen Tipp für heute gefunden..." },
        { status: 404 }
      );
    }

    const { title, content } = tip;
    const no = removeLeadingZeros(tip.no);

    // convert markdown to HTML
    const html = {
      content: await marked(content),
    };

    // send e-mails to all subscribers
    for (const subscriber of subscribers) {
      // const salutation = `Hallo ${subscriber.name}!`;
      const caption = `Hier kommt Dein Erfolgs-Tipp für den ${today.toLocaleDateString(
        "de-DE"
      )}!`;
      const tipNumElement = `<p style='text-align: right; font-size: 6pt'>${no}</p>`;

      const emailBody = [
        // `<p>${salutation}</p>`,
        // `<p>${caption}</p>`,
        title ? `<h2>${title}</h2>` : "",
        html.content,
        tipNumElement,
      ].join("");

      await transporter.sendMail({
        from: `Erfolgs-Tipp <${EMAIL_SENDER}>`,
        to: subscriber.email,
        subject: title || caption,
        html: emailBody,
      });
    }

    return NextResponse.json({
      message: "E-Mails erfolgreich gesendet!",
      subject: title,
      content: html.content,
      no: tip.no,
      numSubscribers: subscribers.length,
    });
  } catch (error) {
    const { message } = error as Error;
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.close();
  }
}
