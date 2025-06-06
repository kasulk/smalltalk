import { NextResponse, NextRequest } from "next/server";
import { MongoClient } from "mongodb";
import { marked } from "marked";
import { apiAuthCheck, removeLeadingZeros } from "../utils";
import { transporter } from "@/utils";
import { getRandomNumBetweenZeroAnd } from "./utils";

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

  // only execute about every 1/24 time (basically once per day, if API is called hourly)
  const randomNum = getRandomNumBetweenZeroAnd(24);
  if (randomNum !== 0) {
    return NextResponse.json(
      { message: "Zufallszahl nicht 0. Keine E-Mails gesendet.", randomNum },
      { status: 404 }
    );
  }

  try {
    await client.connect();
    const db = client.db("ich-kann-das-sms");
    const tips = db.collection("tips");

    const randomDocuments = await tips
      .aggregate([{ $sample: { size: 1 } }]) // $sample ist Aggregation-Operator, der size-viele zufällige Dokumente zurückgibt
      .toArray();

    const tip = randomDocuments[0];
    const subscribers = await db.collection("subscribers").find().toArray();

    if (!tip) {
      return NextResponse.json(
        { message: "Keinen zufaelligen Tipp gefunden..." },
        { status: 404 }
      );
    }

    const { content } = tip;
    const page = removeLeadingZeros(tip.page);

    // convert markdown to HTML
    const html = {
      content: await marked(content),
    };

    // send e-mails to all subscribers
    for (const subscriber of subscribers) {
      const emailBody = [
        html.content,
        `<p style='text-align: right; font-size: 6pt'>${page}</p>`,
      ].join("");

      await transporter.sendMail({
        from: `Marc <${EMAIL_SENDER}>`,
        to: subscriber.email,
        subject: `SMS von Marc`,
        html: emailBody,
      });
    }

    return NextResponse.json({
      message: "E-Mails erfolgreich gesendet!",
      subject: `SMS von Marc`,
      content: html.content,
      page,
      numSubscribers: subscribers.length,
      randomNum,
    });
  } catch (error) {
    const { message } = error as Error;
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.close();
  }
}
