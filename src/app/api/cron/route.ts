import type { NextRequest } from "next/server";
import { sendEmail } from "./utils";

const {
  NODE_ENV,
  CRON_SECRET,
  NEXT_LOCAL_BASE_URL,
  NEXT_PUBLIC_BASE_URL,
  EMAIL_SENDER,
} = process.env;

const isDevMode = NODE_ENV === "development";

const NEXT_BASE_URL = isDevMode ? NEXT_LOCAL_BASE_URL : NEXT_PUBLIC_BASE_URL;

const TIMEOUTS = {
  notnice: 0,
  smalltalk: 21600000, // 6 hrs. // 6*60*60*1000
};

if (!CRON_SECRET) throw new Error("No CRON_SECRET provided!");
if (!NEXT_BASE_URL) throw new Error("No NEXT_BASE_URL provided!");

export async function GET(request: NextRequest) {
  // auth-check (only in production)
  if (!isDevMode) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  console.log("✅ Authentication successful, cron job triggered!");

  const headers = {
    Authorization: `Bearer ${CRON_SECRET}`,
  };

  /// API calls
  // call send-not-nice-bootcamp-API-Route immediately
  try {
    await fetch(`${NEXT_BASE_URL}/api/send-not-nice-bootcamp`, {
      headers,
    });
    console.log(
      "📨 send-not-nice-bootcamp-API-Route successfully called immediately!"
    );
  } catch (error) {
    const { message } = error as Error;
    sendEmail(EMAIL_SENDER, message, "Error on Not-Nice-Bootcamp-API-Call!");
    console.error(
      "❌ Error calling send-not-nice-bootcamp-API Route:\n\n",
      error
    );
  }

  // call send-smalltalktip-API-Route after 6 hrs
  setTimeout(async () => {
    try {
      await fetch(`${NEXT_BASE_URL}/api/send-smalltalktip`, { headers });
      console.log(
        `📨 send-smalltalktip-API-Route successfully called after ${
          TIMEOUTS.smalltalk / 1000
        } secs!`
      );
    } catch (error) {
      const { message } = error as Error;
      sendEmail(EMAIL_SENDER, message, "Error on Smalltalk-API-Call!");
      console.error("❌ Error calling send-smalltalktip-API Route:\n\n", error);
    }
  }, TIMEOUTS.smalltalk);

  return new Response(
    JSON.stringify({
      message: "✅ Cron job triggered and API calls scheduled!",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
