import { NextRequest } from "next/server";

const API_URL = (process.env.GCD_API_URL ?? "https://gcd-api.yas.tg").replace(/\/$/, "");
const TIMEOUT_MS = 300_000;

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function upstreamAuthorization(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization) return authorization;
  const token = request.headers.get("x-gcd-token");
  return token ? `Bearer ${token}` : "";
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(`${API_URL}/${path.map((segment) => encodeURIComponent(segment)).join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  const authorization = upstreamAuthorization(request);
  if (authorization) headers.set("Authorization", authorization);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const accept = request.headers.get("accept");
  if (accept) headers.set("Accept", accept);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const responseHeaders = new Headers();
    for (const name of ["content-type", "content-disposition", "content-length"]) {
      const value = response.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return Response.json(
      {
        status: {
          code: 504,
          description: timedOut
            ? "Le serveur a mis trop de temps à répondre."
            : "Le serveur n'a pas répondu correctement.",
        },
      },
      { status: 504 },
    );
  }
}

export function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}
