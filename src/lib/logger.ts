type LogLevel = "error" | "warn" | "info" | "debug";

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({ level, message, ts: new Date().toISOString(), ...meta });
  // Server-side structured logging. console is the transport, not app code.
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  error: (m: string, meta?: Record<string, unknown>) => emit("error", m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => emit("warn", m, meta),
  info: (m: string, meta?: Record<string, unknown>) => emit("info", m, meta),
  debug: (m: string, meta?: Record<string, unknown>) => emit("debug", m, meta),
};

// Logs the real error server-side, returns a generic Spanish Error for the client.
// Never let raw DB/SQL errors or stack traces reach the user.
export function sanitizeError(err: unknown, userMessage: string): Error {
  log.error("sanitized_error", {
    detail: err instanceof Error ? err.message : String(err),
  });
  return new Error(userMessage);
}
