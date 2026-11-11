import type { RequestHandler } from "express";
export function identityGuard(
  url = process.env.IDENTITY_URL ?? "http://127.0.0.1:3002",
): RequestHandler {
  return async (req, res, next) => {
    const authorization = req.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Đăng nhập qua Portal để sử dụng ERP." });
      return;
    }
    try {
      const r = await fetch(url + "/api/me", {
        headers: { Authorization: authorization },
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) {
        res
          .status(r.status === 401 ? 401 : 503)
          .json({ error: "Phiên hết hạn hoặc Identity không sẵn sàng." });
        return;
      }
      const u = await r.json();
      if (!["admin", "operations", "viewer"].includes(u.role)) {
        res.status(403).json({ error: "Không có quyền sử dụng ERP." });
        return;
      }
      if (!["GET", "HEAD"].includes(req.method) && u.role === "viewer") {
        res.status(403).json({ error: "Tài khoản chỉ có quyền xem." });
        return;
      }
      res.locals.user = u;
      next();
    } catch {
      res.status(503).json({ error: "Không kết nối được Identity." });
    }
  };
}
