import { NextResponse, NextRequest } from "next/server";
import { MongoClient } from "mongodb";
import { marked } from "marked";
import { apiAuthCheck } from "../utils";
import { transporter } from "@/utils";
import { formatDateToMMDD, replaceYearPlaceholdersWithNumYears } from "./utils";

const { MONGODB_URI, EMAIL_SENDER, CRON_USERNAME, CRON_SECRET, NODE_ENV } =
  process.env;

const isDevMode = NODE_ENV === "development";

if (!MONGODB_URI) throw new Error("No MONGODB_URI provided!");
if (!CRON_USERNAME) throw new Error("No CRON_USERNAME provided!");
if (!CRON_SECRET) throw new Error("No CRON_SECRET provided!");

// MongoDB connection
const client = new MongoClient(MONGODB_URI);
let logMessage: string;

export async function GET(request: NextRequest) {
  // auth-check (only in production)
  if (!isDevMode) apiAuthCheck(request, process.env);

  try {
    await client.connect();
    const db = client.db("smalltalk");

    const today = new Date();
    const todayMMDD = formatDateToMMDD(today);
    const currYear = today.getFullYear();

    const tip = await db.collection("tips").findOne({ date: todayMMDD });
    const subscribers = await db.collection("subscribers").find().toArray();

    if (!tip) {
      logMessage = `❌ Keinen Tipp fuer heute gefunden`;
      console.log(logMessage);
      return NextResponse.json({ message: logMessage }, { status: 404 });
    }

    const title = replaceYearPlaceholdersWithNumYears(tip.title, currYear);
    const content = replaceYearPlaceholdersWithNumYears(
      tip.content,
      currYear
    ).replace("$thisYear", currYear.toString());

    // convert markdown to HTML
    const html = {
      content: await marked(content),
    };

    // send e-mails to all subscribers
    for (const subscriber of subscribers) {
      const salutation = `Hallo ${subscriber.name}!`;
      const caption = `Hier kommt Dein SmallTalk-Tipp für den ${today.toLocaleDateString(
        "de-DE"
      )}!`;

      const emailBody =
        `<p>${salutation}</p>` +
        `<p>${caption}</p>` +
        `<h2>${title}</h2>` +
        html.content;

      await transporter.sendMail({
        from: `Smalltalk-Tipp <${EMAIL_SENDER}>`,
        to: subscriber.email,
        subject: title || caption,
        html: emailBody,
      });
    }

    logMessage = "✅ E-Mails erfolgreich gesendet!";

    return NextResponse.json({
      message: logMessage,
      subject: title,
      content: html.content,
      date: todayMMDD,
      numSubscribers: subscribers.length,
    });
  } catch (error) {
    const { message } = error as Error;
    console.log(message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.close();
  }
}
