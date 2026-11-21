import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { QitsAppLinks } from '@qits/ui-components';
import { landingOrigin } from '../ui/landing-origin';
import { NAVIGATE_AWAY } from '../ui/navigate-away';

/** The landing app's own path for this page's one address. */
const LANDING_PATH = '/mirror/upstreams';

/**
 * `upstreams` — the OCI upstreams listing moved to the landing app (qits-2357), at
 * `<landing origin>/mirror/upstreams`. `repositories/:repository`, one cached repository's own
 * page, stayed here and is untouched, as did `''`, the cached-repositories listing.
 *
 * This draws almost nothing of its own: a message naming where the page went, with a link to it,
 * for as long as the hand-off itself is still in flight — and the hand-off is what actually sends
 * a reader there, through {@link NAVIGATE_AWAY} rather than the router, because the destination is
 * a different Angular application and a `routerLink` would compile and go nowhere.
 *
 * Copied from qits-system-frontend's `ServicesRedirect` (qits-2344), the same shape of hand-off for
 * its own moved page.
 */
@Component({
  selector: 'app-upstreams-redirect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>
      The OCI upstreams moved to the landing app.
      @if (href(); as url) {
        <a [href]="url">{{ url }}</a>
      } @else {
        <span>Resolving the landing app's address…</span>
      }
    </p>
  `,
})
export class UpstreamsRedirect {
  /** The landing app's address for this page, once an origin for it is known. */
  protected readonly href = signal<string | undefined>(undefined);

  constructor() {
    const links = inject(QitsAppLinks);
    const navigateAway = inject(NAVIGATE_AWAY);
    void landingOrigin(links).then((origin) => {
      const url = `${origin.replace(/\/+$/, '')}${LANDING_PATH}`;
      this.href.set(url);
      navigateAway(url);
    });
  }
}
