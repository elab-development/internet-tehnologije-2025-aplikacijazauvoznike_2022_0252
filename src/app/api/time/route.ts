import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = verifyAuthToken(token);

    if (!role) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const response = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Europe/Belgrade",
      { cache: "no-store" }
    );

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch external time API" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const externalDate = new Date(data.dateTime);

    return Response.json({
      externalTime: externalDate.getTime(),
      serverNow: Date.now(), 
    });
  } catch (err) {
    console.error("GET /api/time error:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}