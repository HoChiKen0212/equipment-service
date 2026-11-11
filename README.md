# equipment-svc

Equipment business capability. Paired repository: `web-equipment`.

## Run and build

```sh
npm ci --registry=https://registry.npmjs.org
npm run build
npm start
```

Run `npm test` for service regression tests. Node.js 24.12+ is required. Set `HOST` and `PORT`; APIs use `IDENTITY_URL` for independent session checks. Browser access comes through `portal-svc`, not directly to service ports.

This is an authenticated capability adapter during migration. `src/policy.ts` defines its endpoint allowlist. It forwards allowed commands/read models to `OPERATIONS_URL`; it does **not** yet own an independent domain database. No sibling source imports or shared database mounts are used.

## Integration and ownership

The parent integration workspace supplies `compose.yaml`, optional runner scripts and the canonical business/architecture/API/deployment documents. This repository can be checked out and built independently; root orchestration expects sibling repository names. Publication to a remote Git host is a separate action.
