import { existsSync } from "node:fs";
import { createApp } from "./app";
if (existsSync(".env")) process.loadEnvFile(".env");
const server = createApp().listen(
  Number(process.env.PORT ?? 3013),
  process.env.HOST ?? "127.0.0.1",
);
for (const sig of ["SIGINT", "SIGTERM"])
  process.on(sig, () => server.close(() => process.exit(0)));
