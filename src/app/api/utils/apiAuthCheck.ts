import { NextRequest } from "next/server";

export function apiAuthCheck(
  request: NextRequest,
  env: NodeJS.ProcessEnv
): Response | void {
  const authHeader = request.headers.get("authorization");
  const { CRON_USERNAME, CRON_SECRET } = env;

  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  // e.g. API-check with Vercel cron job
  if (authHeader.startsWith("Bearer ")) {
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // e.g. API-check with all-inkl cron job
  if (authHeader.startsWith("Basic ")) {
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = atob(base64Credentials).split(":");
    const [username, password] = credentials;

    if (username !== CRON_USERNAME || password !== CRON_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  console.log("✅ Authentication successful, cron job triggered!");
}
