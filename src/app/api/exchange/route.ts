import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";


/**
 * @swagger
 * /api/exchange:
 *   get:
 *     summary: Get exchange rates
 *     description: Returns current exchange rates from EUR base currency.
 *     tags:
 *       - Exchange
 *     responses:
 *       200:
 *         description: Exchange rates successfully returned
 *         content:
 *           application/json:
 *             example:
 *               base: EUR
 *               date: "2026-03-07"
 *               rates:
 *                 USD: 1.08
 *                 RSD: 117.2
 *       401:
 *         description: Unauthorized (missing or invalid auth token)
 *       500:
 *         description: Internal server error
 */


export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    verifyAuthToken(token);

    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/EUR",
      { cache: "no-store" }
    );

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch exchange rates" },
        { status: 500 }
      );
    }

    const data = await response.json();

    return Response.json({
      base: data.base,
      rates: data.rates,
      date: data.date,
    });
  } catch (err) {
    console.error("Exchange rates error:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}