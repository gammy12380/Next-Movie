const BASE_URL = process.env.NEXT_PUBLIC_TMDB_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const DEFAULT_HEADERS = {
  accept: "application/json",
  "content-type": "application/json",
};

export interface FetchOptions<T> {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number | undefined>;
  body?: T;
}

export const fetchAPI = async <Res = unknown, Req = unknown>(
  _url: string,
  options: FetchOptions<Req> = {},
  isCustomUrl?: boolean
): Promise<Res> => {
  const { method = "GET", headers = {}, queryParams, body } = options;

  if (queryParams && typeof queryParams !== "object") {
    throw new Error("queryParams must be an object");
  }

  if (body && typeof body !== "object") {
    throw new Error("Body must be an object");
  }

  const url = isCustomUrl ? new URL(`${_url}`) : new URL(`${BASE_URL}${_url}`);

  const sessionId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("session-id")
      : null;

  const buildQueryParams = (
    queryParams?: Record<string, string | number | undefined>
  ) => {
    const fullQueryParams: Record<string, string | number | undefined> = {};
    if (sessionId) {
      fullQueryParams.session_id = sessionId;
    }
    if (queryParams) {
      Object.assign(fullQueryParams, queryParams);
    }
    fullQueryParams.api_key = API_KEY;
    if (!fullQueryParams.hasOwnProperty("language")) {
      fullQueryParams.language = "zh-TW";
    }
    return fullQueryParams;
  };

  const fullQueryParams = buildQueryParams(queryParams);

  Object.entries(fullQueryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: { ...DEFAULT_HEADERS, ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return {} as Res;
    }

    let data: Res;
    try {
      data = JSON.parse(text) as Res;
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON: ${jsonError}`);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${_url}:`, error);
    throw error;
  }
};
