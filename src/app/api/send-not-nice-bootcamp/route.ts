import { NextResponse, NextRequest } from "next/server";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import { marked } from "marked";
import { getDayNumFromDate } from "./utils";

type Data = {
  dayNo: number;
  dayTitle: string;
  weekNo: number | string;
  weekTitle: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

const {
  MONGODB_URI,
  EMAIL_SENDER,
  EMAIL_SENDER_PASSWORD,
  EMAIL_SENDER_HOST,
  CRON_SECRET,
  NODE_ENV,
} = process.env;

const isDevMode = NODE_ENV === "development";

if (!MONGODB_URI) throw new Error("No MONGODB_URI provided!");
if (!CRON_SECRET) throw new Error("No CRON_SECRET provided!");

// MongoDB connection
const client = new MongoClient(MONGODB_URI);

export async function GET(request: NextRequest) {
  // auth-check (only in production)
  if (!isDevMode) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    await client.connect();
    const db = client.db("not-nice-bootcamp");

    const today = new Date();
    const todayDayNum = getDayNumFromDate(today);

    const data = (await db
      .collection("data")
      .findOne({ dayNo: todayDayNum })) as unknown as Data;
    const subscribers = await db.collection("subscribers").find().toArray();

    if (!data) {
      return NextResponse.json(
        { message: "Keine Challenge für heute gefunden" },
        { status: 404 }
      );
    }

    const { dayTitle: title, content } = data;
    const { weekNo, weekTitle } = data;

    // convert markdown to HTML
    const html = {
      content: await marked(content),
    };

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

    // send e-mails to all subscribers
    for (const subscriber of subscribers) {
      const salutation = `Guten Morgen Rockstar!`;
      const caption = `Hier kommt Deine Challenge für den ${today.toLocaleDateString(
        "de-DE"
      )}!`;

      const emailBody =
        `<p>Day ${todayDayNum}/Week ${weekNo}: ${weekTitle}</p>` +
        `<p>${salutation}</p>` +
        `<p>${caption}</p>` +
        `<h2>${title}</h2>` +
        html.content;

      await transporter.sendMail({
        from: `Not Nice Bootcamp <${EMAIL_SENDER}>`,
        to: subscriber.email,
        subject: title || caption,
        html: emailBody,
      });
    }

    return NextResponse.json({
      message: "E-Mails erfolgreich gesendet!",
      subject: title,
      content: html.content,
      date: todayDayNum,
      numSubscribers: subscribers.length,
    });
  } catch (error) {
    const { message } = error as Error;
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.close();
  }
}
