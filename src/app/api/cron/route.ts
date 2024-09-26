import type { NextRequest } from "next/server";

const { NODE_ENV, CRON_SECRET, NEXT_LOCAL_BASE_URL, NEXT_PUBLIC_BASE_URL } =
  process.env;

const isDevMode = NODE_ENV === "development";

const NEXT_BASE_URL = isDevMode ? NEXT_LOCAL_BASE_URL : NEXT_PUBLIC_BASE_URL;

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

  console.log("Authentication successful, cron job triggered!");

  const headers = {
    Authorization: `Bearer ${CRON_SECRET}`,
  };

  /// API calls
  // call send-smalltalktip-API-Route immediately
  try {
    await fetch(`${NEXT_PUBLIC_BASE_URL}/api/send-smalltalktip`, { headers });
    console.log("send-smalltalktip-API-Route successfully called immediately!");
  } catch (error) {
    console.error("Error calling send-smalltalktip-API Route:", error);
  }

  // call API Route 2 after a 10-second delay
  setTimeout(async () => {
    try {
      await fetch(`${NEXT_PUBLIC_BASE_URL}/api/route2`, { headers });
      console.log("API Route 2 called successfully after delay!");
    } catch (error) {
      console.error("Error calling API Route 2:", error);
    }
  }, 10000);

  return new Response(
    JSON.stringify({ message: "Cron job triggered and API calls scheduled!" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
