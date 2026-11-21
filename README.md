# qits-mirror-platform-frontend

The old mirror explorer, now only hand-offs. Served by qits-mirror itself at `/` on
`mirror.<domain>` through Quinoa. Every page moved to the landing app's Mirror section, and each
route here sends a reader there with a full-document load, so bookmarks still land:

- **`/`** → `<landing>/mirror/repositories`, every cache root (qits-2471).
- **`/repositories/<name>`** → `<landing>/mirror/repositories/<name>`, one cache root (qits-2358).
- **`/upstreams`** → `<landing>/mirror/upstreams`, the OCI registries it fronts (qits-2357).

The landing origin comes from the platform navigation (`src/app/ui/landing-origin.ts`), with a
bounded wait; the navigation itself is `src/app/ui/navigate-away.ts`, a token a spec replaces.

qits-mirror-platform-service carries this repository as a git submodule at
`service/src/main/webui` — Quinoa's `web-ui-dir` — and builds it during `mvn package`, serving the
bundle at `/`. The root is spelled here as `baseHref` in `angular.json` and there as
`quarkus.quinoa.ui-root-path`; the two move together. This repository ships no container image of
its own.

**This is a `system` app.** Its pages are about the platform's caches rather than about one project,
so it routes no `/<projectSlug>/...` form — `provideQitsScope('system')` in `app.config.ts` says so,
and picking a project in the chrome's picker leaves for qits-projects instead of rewriting an address
this app does not serve. The old bare-`/mirror` trailing-slash wart went with the move to the root.

## Development server

```bash
ng serve
```

Then open `http://localhost:4200/`. `proxy.conf.json` forwards `/mirror/api`, `/projects/api` and
`/main-navigation` to an edge on `localhost:8080`, because `ng serve` puts none in front. In a
deployment every call is a same-origin path behind the real edge. These reads carry no credential in
either case.

With no edge answering `/main-navigation` the sidebar renders "Navigation unavailable" and this
app's own two views appear beneath it. That is the intended degraded state, not a fault.

## Running the checks

```bash
npm run lint && npm test && npm run build
```

The same three, in the same order, are what `.config/qits/ci-event-release-request.yml` runs on a
release request's fold — the one pipeline this repository has, since nothing builds on a push any
more. Note what that pipeline installs from: the npm proxy behind it **is** qits-platform-mirror,
and the `@qits` scope comes from qits-artifacts — so a run here cannot be green while either service
is down. Their deploys are taken alone, with the CI queue empty.

## Building

```bash
ng build
```

The bundle lands in `dist/qits-platform-spa-mirror/browser`, which is the path
`quarkus.quinoa.build-dir` names on the service side.

## Running unit tests

```bash
ng test
```

Vitest on jsdom — no browser, which is what lets CI run them.
