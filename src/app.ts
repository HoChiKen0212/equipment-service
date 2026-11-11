import express from "express";
import { identityGuard } from "./auth";
import { allowed } from "./policy";
export function createApp(
  core = process.env.OPERATIONS_URL ?? "http://127.0.0.1:3001",
  authorize: express.RequestHandler = identityGuard(),
) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", (_q, r) => r.json({ status: "ok" }));
  app.use("/api", authorize);
  app.use("/api", async (q, r) => {
    if (
      !allowed.some((p) =>
        new RegExp("^" + p + "$").test(q.method + " " + q.path),
      )
    ) {
      r.status(404).json({ error: "Endpoint is outside this capability." });
      return;
    }
    const response = await fetch(core + "/api" + q.url, {
      method: q.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: q.get("Authorization") ?? "",
      },
      body: ["GET", "HEAD"].includes(q.method)
        ? undefined
        : JSON.stringify(q.body),
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    r.status(response.status)
      .type(response.headers.get("Content-Type") ?? "application/json")
      .send(Buffer.from(await response.arrayBuffer()));
  });
  app.use(
    (
      e: Error,
      _q: express.Request,
      r: express.Response,
      _n: express.NextFunction,
    ) =>
      r
        .status(e instanceof SyntaxError ? 400 : 503)
        .json({ error: "Invalid request or upstream unavailable." }),
  );
  return app;
}
