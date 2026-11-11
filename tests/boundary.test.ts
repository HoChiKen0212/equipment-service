import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import { createApp } from "../src/app";
import { allowed } from "../src/policy";
test("Capability denies foreign commands and forwards session credentials to its fixed core", async () => {
  const upstream = express();
  upstream.get("/api/data", (q, r) =>
    r.json({ authorization: q.get("Authorization") }),
  );
  const core = upstream.listen(0, "127.0.0.1");
  await once(core, "listening");
  const app = createApp(
    "http://127.0.0.1:" + (core.address() as { port: number }).port,
    (q, r, n) => {
      if (!q.get("Authorization")) {
        r.status(401).end();
        return;
      }
      n();
    },
  );
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const url = "http://127.0.0.1:" + (server.address() as { port: number }).port;
  try {
    assert.equal((await fetch(url + "/api/data")).status, 401);
    const data = await (
      await fetch(url + "/api/data", {
        headers: { Authorization: "Bearer session" },
      })
    ).json();
    assert.equal(data.authorization, "Bearer session");
    assert.equal(
      (
        await fetch(url + "/api/bills/x/issue", {
          method: "POST",
          headers: {
            Authorization: "Bearer session",
            "Content-Type": "application/json",
          },
          body: "{}",
        })
      ).status,
      404,
    );
    assert.ok(allowed.length > 3);
  } finally {
    await Promise.all(
      [core, server].map((s) => new Promise<void>((r) => s.close(() => r()))),
    );
  }
});
