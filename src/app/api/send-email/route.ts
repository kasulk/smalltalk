import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import { marked } from "marked";
import { formatDateToMMDD } from "./utils/formatDateToMMDD";

// MongoDB connection
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db("smalltalk");

    const today = new Date();
    const todayMMDD = formatDateToMMDD(today);

    const tip = await db.collection("tips").findOne({ date: todayMMDD });
    const subscribers = await db.collection("subscribers").find().toArray();

    if (!tip) {
      return NextResponse.json(
        { message: "Keinen Tipp für heute gefunden" },
        { status: 404 }
      );
    }

    // convert markdown to HTML
    const html = {
      title: await marked(tip.title || ""),
      content: await marked(tip.content),
    };

    // configuration of SMTP-Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SENDER_HOST,
      port: 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_SENDER_PASS,
      },
    });

    // send e-mails to all subscribers
    for (const subscriber of subscribers) {
      const salutation = `Hallo ${subscriber.name}!`;
      const caption = `Hier kommt Dein SmallTalk-Tipp für den ${today.toLocaleDateString(
        "de-DE"
      )}!`;

      const emailBody =
        `<p>${salutation}</p>` +
        `<p>${caption}</p>` +
        `<h2>${html.title}</h2>` +
        html.content;

      await transporter.sendMail({
        from: process.env.EMAIL_SENDER,
        to: subscriber.email,
        subject: tip.title || caption,
        html: emailBody,
      });
    }

    return NextResponse.json({
      message: "E-Mails erfolgreich gesendet!",
      subject: tip.title,
      content: html.content,
      date: todayMMDD,
      numSubscribers: subscribers.length,
    });
  } catch (error) {
    const { message } = error as Error;
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.close();
  }
}
