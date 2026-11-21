import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QitsAppLinks } from '@qits/ui-components';
import { landingOrigin } from '../ui/landing-origin';
import { NAVIGATE_AWAY } from '../ui/navigate-away';

/** The landing app's own path for this page, one cached repository's own contents. */
const LANDING_PATH = '/mirror/repositories/';

/**
 * `repositories/:repository` — one cached repository's own page, moved to the landing app
 * (qits-2358), at `<landing origin>/mirror/repositories/<encodeURIComponent(name)>`. `''`, the
 * cached-repositories listing, stays here until qits-2471.
 *
 * This draws almost nothing of its own: a message naming where the page went, with a link to it,
 * for as long as the hand-off itself is still in flight — and the hand-off is what actually sends
 * a reader there, through {@link NAVIGATE_AWAY} rather than the router, because the destination is
 * a different Angular application and a `routerLink` would compile and go nowhere.
 *
 * Copied from this repository's own `UpstreamsRedirect` (qits-2357), the same shape of hand-off for
 * its own moved page.
 */
@Component({
  selector: 'app-repository-redirect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>
      This cache's page moved to the landing app.
      @if (href(); as url) {
        <a [href]="url">{{ url }}</a>
      } @else {
        <span>Resolving the landing app's address…</span>
      }
    </p>
  `,
})
export class RepositoryRedirect {
  /** The landing app's address for this page, once an origin for it is known. */
  protected readonly href = signal<string | undefined>(undefined);

  constructor() {
    const name = inject(ActivatedRoute).snapshot.paramMap.get('repository') ?? '';
    const links = inject(QitsAppLinks);
    const navigateAway = inject(NAVIGATE_AWAY);
    void landingOrigin(links).then((origin) => {
      const url = `${origin.replace(/\/+$/, '')}${LANDING_PATH}${encodeURIComponent(name)}`;
      this.href.set(url);
      navigateAway(url);
    });
  }
}
