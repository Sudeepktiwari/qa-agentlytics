// CORS utility for all API routes
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, x-api-key, Cookie, Authorization",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

// Helper function to create CORS-enabled responses
export function corsResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...init?.headers,
    },
  });
}

// Helper function for Next.js responses with CORS
export function corsNextResponse(
  data: unknown,
  init?: Parameters<typeof Response.json>[1]
) {
  return Response.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init?.headers,
    },
  });
}

// Standard OPTIONS handler
export function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
