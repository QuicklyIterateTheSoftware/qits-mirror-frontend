import type { Routes } from '@angular/router';
import { QitsMainLayout } from '@qits/ui-components';
import { NotFound } from './not-found/not-found';
import { RepositoriesRedirect } from './repositories/repositories-redirect';
import { RepositoryRedirect } from './repositories/repository-redirect';
import { UpstreamsRedirect } from './upstreams/upstreams-redirect';

/**
 * Three hand-offs, all inside the platform chrome: every page of this app moved to the landing
 * app.
 *
 * `QitsMainLayout` is the **root route component**, not a tag wrapped around each page — the
 * platform's convention, stated in the component's own docs. Mounted this way the bar and the
 * navigation mount once and survive every navigation beneath them; wrapping each page in a tag
 * would rebuild the whole skeleton on every hop.
 *
 * Its links leave this SPA on purpose: every destination is a different Angular application on a
 * host of its own, so they are plain `<a href>` full-document navigations. The tree comes from
 * `provideQitsNavigation()` — see app.config.ts — and this client passes no links of its own. The
 * two doors *inside* this app are a sub-menu the shell hands to the layout instead; see app.ts.
 *
 * **`upstreams` is a hand-off, not a page.** The OCI upstreams listing moved to the landing app
 * (qits-2357), at `<landing origin>/mirror/upstreams`; this route's component, `UpstreamsRedirect`,
 * draws a short sentence and sends a reader there with a full-document navigation rather than the
 * router, because the destination is a different Angular application. It keeps its path and its
 * `ViewNav` entry so the address and the sub-menu link both still work — they just end up somewhere
 * else now.
 *
 * **`repositories/:repository` is a hand-off too.** One cached repository's own page moved to the
 * landing app (qits-2358), at `<landing origin>/mirror/repositories/<encodeURIComponent(name)>`;
 * `RepositoryRedirect` is the same shape of hand-off as `UpstreamsRedirect`.
 *
 * **`''` is a hand-off too.** The cached-repositories listing moved to the landing app
 * (qits-2471), at `<landing origin>/mirror/repositories`; `RepositoriesRedirect` sends a reader
 * there the same way.
 *
 * **Each view is a path segment**, so every one is bookmarkable and the back button works with no
 * code. They are siblings rather than a drill-down: cached repositories and mirrored registries are
 * two different questions about the same service, and neither is inside the other.
 *
 * Every route here loads eagerly. There are only four of them, they share every component below
 * them, and a lazy chunk boundary would be ceremony that costs a round trip.
 *
 * **Every address here starts at the root**, because this application is served at `/` on its own
 * host. It is a `system` app: its pages are about the platform's caches rather than about one
 * project, so it has no `/<slug>/...` form and adds none — picking a project in the chrome leaves
 * for qits-projects instead.
 *
 * The `**` route sits inside the layout: this host is this application's outright, so an unknown URL
 * on it is an ordinary 404 and is drawn with the chrome around it.
 */
export const routes: Routes = [
  {
    path: '',
    component: QitsMainLayout,
    children: [
      { path: '', component: RepositoriesRedirect },
      { path: 'repositories/:repository', component: RepositoryRedirect },
      { path: 'upstreams', component: UpstreamsRedirect },
      { path: '**', component: NotFound },
    ],
  },
];
