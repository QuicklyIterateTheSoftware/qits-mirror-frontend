import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { QitsAppLinks } from '@qits/ui-components';
import { landingOrigin } from '../ui/landing-origin';
import { NAVIGATE_AWAY } from '../ui/navigate-away';

/** The landing app's own path for this page, every cache root the mirror holds. */
const LANDING_PATH = '/mirror/repositories';

/**
 * `''` — the cached-repositories listing, moved to the landing app (qits-2471), at
 * `<landing origin>/mirror/repositories`. With it, every page of this app hands off.
 *
 * The same shape of hand-off as `RepositoryRedirect` and `UpstreamsRedirect`: a message naming
 * where the page went, with a link once the landing origin is known, while {@link NAVIGATE_AWAY}
 * sends the reader there with a full-document load (the destination is a different Angular
 * application).
 */
@Component({
  selector: 'app-repositories-redirect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>
      The cached repositories moved to the landing app.
      @if (href(); as url) {
        <a [href]="url">{{ url }}</a>
      } @else {
        <span>Resolving the landing app's address…</span>
      }
    </p>
  `,
})
export class RepositoriesRedirect {
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
