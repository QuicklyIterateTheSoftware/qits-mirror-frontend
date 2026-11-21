import type { QitsAppLinks } from '@qits/ui-components';

/**
 * How long a hand-off page waits for the navigation to name `qits-landing`'s origin before giving
 * up on it and using whatever `QitsAppLinks.environmentOrigin` already answers.
 *
 * This can be the very first thing a browser requests, with no chrome mounted yet to have asked
 * the navigation the question first, so it waits itself, briefly, rather than firing at an origin
 * it has not actually been told yet. Ported from qits-system-frontend's `ServicesRedirect`
 * (qits-2344), where the same rule serves its own hand-off page. Shared between this app's two
 * hand-offs — `upstreams` (qits-2357) and `repositories/:repository` (qits-2358).
 */
export const LANDING_ORIGIN_WAIT_MS = 1500;

/**
 * Where `qits-landing` answers: `QitsAppLinks.origin` first, `environmentOrigin` second — which on
 * this platform *is* the apex landing serves from — empty third, past {@link LANDING_ORIGIN_WAIT_MS}.
 *
 * `whenApiOrigin('qits-landing')` settles the moment the navigation does, which on a warm platform
 * is a single microtask. Past the bound the wait is abandoned and `environmentOrigin` is read as
 * it stands right now instead, so a reader is never left on this page by a navigation that is
 * merely slow — or that never answers at all.
 */
export async function landingOrigin(links: QitsAppLinks): Promise<string> {
  const settled = links
    .whenApiOrigin('qits-landing')
    .then(() => links.origin('qits-landing') ?? links.environmentOrigin() ?? '');
  const bound = new Promise<string>((resolve) => {
    setTimeout(() => resolve(links.environmentOrigin() ?? ''), LANDING_ORIGIN_WAIT_MS);
  });
  return Promise.race([settled, bound]);
}
