import axios from "axios";
const LOG_API = "http://20.244.56.144/evaluation-service/logs";
const levels = ["debug", "info", "warn", "error", "fatal"];
const packages = [
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils"
];

export async function logEvent(
  level: string,
  pkg: string,
  message: string
): Promise<void> {
  if (!levels.includes(level)) {
    console.error(`Invalid log level: ${level}`);
    return;
  }
  if (!packages.includes(pkg)) {
    console.error(`Invalid package: ${pkg}`);
    return;
  }

  try {
    const response = await axios.post(LOG_API, {
      stack: "frontend",
      level,
      package: pkg,
      message,
    });

    console.log("Log sent:", response.data);
  } catch (error) {
    console.error("Failed to send log:", error);
  }
}