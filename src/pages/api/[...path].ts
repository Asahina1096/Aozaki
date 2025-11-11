import type { APIRoute } from "astro";

export const prerender = false;

export const ALL: APIRoute = async ({ params, request }) => {
  const backendUrl = import.meta.env.PUBLIC_API_URL || "https://lovejk.cc";
  const path = params.path || "";
  const url = `${backendUrl}/${path}`;

  return fetch(url, {
    method: request.method,
    headers: request.headers,
    body: request.method !== "GET" ? await request.text() : undefined,
  });
};
