// Proxy server from localhost:3000 to OpenAI API

const PORT = Number(Deno.env.get("PORT"));
const TARGET_URL = Deno.env.get("TARGET_URL");

const hostname = "0.0.0.0";

console.log(
  `Proxy server running on http://${hostname}:${PORT} -> ${TARGET_URL}`,
);

Deno.serve({ port: PORT, hostname }, async (req: Request) => {
  try {
    // Extract path and query string from request URL
    const url = new URL(req.url);
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
      body: req.body && req.method !== "GET" && req.method !== "HEAD"
        ? req.body
        : undefined,
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
