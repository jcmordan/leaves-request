import pino, { Logger } from "pino";

let loggerInstance: Logger | null = null;

export function createLogger(): Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  if (process.env["NODE_ENV"] === "production") {
    loggerInstance = pino({ level: "warn" });
  } else if (process.env["NODE_ENV"] === "test") {
    loggerInstance = pino({ level: "silent" });
  } else {
    // In development, avoid pino-pretty transport to prevent worker thread issues
    // with Next.js server components. Use a custom formatter instead.
    loggerInstance = pino({
      level: "debug",
      formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      base: undefined,
    });
  }

  return loggerInstance;
}

export const logger: Logger = createLogger();
