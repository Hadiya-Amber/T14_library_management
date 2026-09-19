/**
 * API helpers for loading featured books from the Library service.
 */

import type { Book } from "./books";

/** Default API base URL used when no Vite env override is provided. */
const DEFAULT_API_BASE = "http://localhost:8000";

/** API base URL for catalogue requests. */
export const API_BASE = (import.meta.env.VITE_LIBRARY_API_URL ?? DEFAULT_API_BASE).replace(/\/$/, "");

/**
 * Record shape accepted from the books endpoint.
 */
interface RawBook {
  id?: unknown;
  title?: unknown;
  author?: unknown;
  cover?: unknown;
  genre?: unknown;
  available?: unknown;
  year?: unknown;
}

/**
 * Converts one raw API record into the Book model used by the shelf.
 *
 * @param raw - Raw API object.
 * @returns A normalized Book record.
 * @throws TypeError When required fields are missing or invalid.
 */
export function toBook(raw: RawBook): Book {
  if (typeof raw !== "object" || raw === null) {
    throw new TypeError("Invalid book record: expected object");
  }

  if (typeof raw.id !== "string" || raw.id.trim() === "") {
    throw new TypeError(`Invalid book id: ${String(raw.id)}`);
  }

  if (typeof raw.title !== "string" || raw.title.trim() === "") {
    throw new TypeError(`Invalid book title: ${String(raw.title)}`);
  }

  if (typeof raw.author !== "string" || raw.author.trim() === "") {
    throw new TypeError(`Invalid book author: ${String(raw.author)}`);
  }

  const cover = typeof raw.cover === "string" ? raw.cover : "";
  const genre = typeof raw.genre === "string" ? raw.genre : "General";
  const available = typeof raw.available === "boolean" ? raw.available : false;
  const year = typeof raw.year === "number" && Number.isFinite(raw.year) ? raw.year : undefined;

  return {
    id: raw.id,
    title: raw.title,
    author: raw.author,
    cover,
    genre,
    available,
    year,
  };
}

/**
 * Loads books from GET /books and aborts after 3000 ms.
 *
 * @param signal - Optional caller-controlled abort signal.
 * @returns Promise resolving to normalized books.
 * @throws Error When the request fails or returns invalid payload data.
 */
export async function fetchBooks(signal?: AbortSignal): Promise<Book[]> {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);

  let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = globalThis.setTimeout(() => {
      controller.abort();
      reject(new Error("Books API request timed out after 3000ms"));
    }, 3000);
  });

  try {
    const response = await Promise.race([
      fetch(`${API_BASE}/books`, {
        method: "GET",
        signal: controller.signal,
      }),
      timeoutPromise,
    ]);

    if (!response.ok) {
      throw new Error(`Books API request failed with status ${response.status}`);
    }

    const payload = await response.json();

    if (!Array.isArray(payload)) {
      throw new TypeError("Invalid books payload: expected an array");
    }

    return payload.map((entry) => toBook(entry as RawBook));
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
    signal?.removeEventListener("abort", forwardAbort);
  }
}
