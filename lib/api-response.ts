import { CACHE_CONFIG, type CacheHeaders } from "./cache";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  request_id?: string;
  timestamp?: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  request_id?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

const ERROR_CODES: Record<string, { statusCode: number; message: string }> = {
  UNAUTHORIZED: { statusCode: 401, message: "Authentication required" },
  FORBIDDEN: { statusCode: 403, message: "Access forbidden" },
  NOT_FOUND: { statusCode: 404, message: "Resource not found" },
  VALIDATION_ERROR: { statusCode: 400, message: "Invalid request parameters" },
  RATE_LIMITED: { statusCode: 429, message: "Rate limit exceeded" },
  INTERNAL_ERROR: { statusCode: 500, message: "Internal server error" },
  SERVICE_UNAVAILABLE: {
    statusCode: 503,
    message: "Service temporarily unavailable",
  },
  METHOD_NOT_ALLOWED: { statusCode: 405, message: "Method not allowed" },
};

let requestCounter = 0;

export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const counter = (requestCounter++ % 1000).toString(36).padStart(3, "0");
  return `${timestamp}-${random}-${counter}`;
}

export function successResponse<T>(
  data: T,
  options: {
    statusCode?: number;
    requestId?: string;
    cache?: keyof typeof CACHE_CONFIG.edge | keyof typeof CACHE_CONFIG;
    meta?: PaginationMeta;
  } = {},
): Response {
  const { statusCode = 200, requestId, cache, meta } = options;
  const id = requestId ?? generateRequestId();

  const body: ApiResponse<T> | PaginatedResponse<T> = {
    success: true,
    data,
    request_id: id,
    timestamp: Date.now(),
  };

  if (meta) {
    (body as PaginatedResponse<T>).meta = meta;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": id,
  };

  if (cache) {
    headers["Cache-Control"] = String(
      (cache as keyof typeof CACHE_CONFIG.edge) in CACHE_CONFIG.edge
        ? CACHE_CONFIG.edge[cache as keyof typeof CACHE_CONFIG.edge]
        : CACHE_CONFIG[cache as keyof typeof CACHE_CONFIG],
    );
  }

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers,
  });
}

export function errorResponse(
  error: string | Error | ApiError,
  options: {
    code?: keyof typeof ERROR_CODES | string;
    statusCode?: number;
    requestId?: string;
    context?: Record<string, unknown>;
  } = {},
): Response {
  const { code = "INTERNAL_ERROR", requestId, context } = options;
  const id = requestId ?? generateRequestId();

  let message: string;
  let errorCode = code;
  let statusCode = options.statusCode ?? 500;

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = error.message;
    errorCode = error.code;
    statusCode = error.statusCode;
  }

  const predefinedError = ERROR_CODES[code];
  if (predefinedError && !options.statusCode) {
    statusCode = predefinedError.statusCode;
    if (message === error || message === "Error") {
      message = predefinedError.message;
    }
  }

  const body: ApiResponse = {
    success: false,
    error: message,
    code: errorCode,
    request_id: id,
    timestamp: Date.now(),
    ...(context ? ({ context } as unknown as ApiResponse) : {}),
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": id,
      "Cache-Control": "no-store",
    },
  });
}

export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  options: {
    requestId?: string;
    cache?: keyof typeof CACHE_CONFIG.edge | keyof typeof CACHE_CONFIG;
  } = {},
): Response {
  return successResponse(data, { ...options, meta });
}

export class ApiErrorClass extends Error {
  constructor(
    message: string,
    public code: keyof typeof ERROR_CODES,
    public statusCode: number = ERROR_CODES[code].statusCode,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function unauthorized(
  message = "Authentication required",
): ApiErrorClass {
  return new ApiErrorClass(message, "UNAUTHORIZED");
}

export function forbidden(message = "Access forbidden"): ApiErrorClass {
  return new ApiErrorClass(message, "FORBIDDEN");
}

export function notFound(message = "Resource not found"): ApiErrorClass {
  return new ApiErrorClass(message, "NOT_FOUND");
}

export function validationError(
  message = "Invalid request parameters",
): ApiErrorClass {
  return new ApiErrorClass(message, "VALIDATION_ERROR");
}

export function rateLimited(
  message = "Rate limit exceeded",
  retryAfter?: number,
): ApiErrorClass {
  const error = new ApiErrorClass(message, "RATE_LIMITED");
  return error;
}

export function serviceUnavailable(
  message = "Service temporarily unavailable",
): ApiErrorClass {
  return new ApiErrorClass(message, "SERVICE_UNAVAILABLE");
}

export function withRequestId<
  T extends (...args: unknown[]) => Response | Promise<Response>,
>(handler: T): T {
  return ((...args: unknown[]) => {
    const response = handler(...args);
    const id = generateRequestId();

    if (response instanceof Response) {
      response.headers.set("X-Request-ID", id);
    } else if (response instanceof Promise) {
      return response.then((r) => {
        r.headers.set("X-Request-ID", id);
        return r;
      });
    }

    return response;
  }) as T;
}

export function handleApiError(error: unknown, requestId?: string): Response {
  console.error("[API Error]", error);

  if (error instanceof ApiErrorClass) {
    return errorResponse(error.message, {
      code: error.code,
      statusCode: error.statusCode,
      requestId,
    });
  }

  if (error instanceof Error) {
    return errorResponse(error.message, {
      code: "INTERNAL_ERROR",
      requestId,
    });
  }

  return errorResponse("An unexpected error occurred", {
    code: "INTERNAL_ERROR",
    requestId,
  });
}
