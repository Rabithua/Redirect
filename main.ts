// Proxy server from localhost:3000 to OpenAI API

const PORT = Number(Deno.env.get("PORT"));
const TARGET_URL = Deno.env.get("TARGET_URL");

const hostname = "0.0.0.0";

console.log(
  `Proxy server running on http://${hostname}:${PORT} -> ${TARGET_URL}`,
);

Deno.serve({ port: PORT, hostname }, async (req: Request) => {
  try {
    const url = new URL(req.url);

    // Clone request for logging, so we don't consume the body
    const reqForLog = req.clone();

    // Prepare body for fetch (only for non-GET/HEAD)
    let fetchBody: BodyInit | null | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      fetchBody = req.body;
    }

    // Log request details (body from cloned request)
    let logBody = "(none)";
    if (reqForLog.body && req.method !== "GET" && req.method !== "HEAD") {
      try {
        logBody = await reqForLog.text();
      } catch {
        logBody = "(unreadable)";
      }
    }

    console.log(
      `\n[${new Date().toLocaleString()}] Incoming Request:\n` +
        `  Method : ${req.method}\n` +
        `  Path   : ${url.pathname}\n` +
        `  Query  : ${url.search || "(none)"}\n` +
        `  From   : ${req.headers.get("x-forwarded-for") || "unknown"}\n` +
        `  Target : ${TARGET_URL}${url.pathname}${url.search}\n` +
        `  Headers:\n` +
        `    ${
          Array.from(req.headers.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n    ")
        }` +
        `\n` +
        `  Body   : ${logBody}`,
    );

    // Extract path and query string from request URL
    const path = url.pathname;
    const query = url.search;

    // Create target URL
    const targetUrl = `${TARGET_URL}${path}${query}`;

    // Clone the request headers
    const headers = new Headers(req.headers);

    // Forward the request to the target
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: fetchBody,
      redirect: "follow",
    });

    // Clone the response and return it
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`Proxy error: ${message}`, { status: 500 });
  }
});
