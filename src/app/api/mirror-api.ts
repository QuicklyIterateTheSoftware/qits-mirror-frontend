import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { QITS_API_BASE } from './api-base';
import type { MirrorRepositoryDto, RepositoriesResponse, RepositoryPackagesResponse } from './dto';

/**
 * Everything this app reads, and it reads from exactly one upstream: qits-platform-mirror, through
 * the gateway, at `/mirror/api`. There is nothing to join against — the mirror holds caches and
 * nothing else this app has a page for; the table of registries it fronts moved to the landing app
 * (qits-2357) and is that app's read now, not this one's.
 *
 * Both calls are one-shot: `firstValueFrom` unwraps the observable immediately, because a promise
 * is what the pages' `async` methods want. `HttpClient` on the fetch backend rather than bare
 * `fetch()` buys two things — `HttpTestingController`, which is the whole basis of this
 * repository's specs, and a call that goes through `window.fetch`, where the platform's browser
 * telemetry can see it.
 *
 * **The repositories listing is enveloped, and the envelope is unwrapped here rather than in a
 * page.** A bare array on the wire has nowhere to put a field the service later wants to add — a
 * generated-at stamp, a paging cursor — so the service sends an object and this seam hands the page
 * the list.
 *
 * **Nothing here writes.** The mirror's caches are filled by clients pulling through them and
 * emptied by a nightly eviction run; there is no route to seed one and no button that could exist.
 *
 * `httpResource()` would suit these reads well and is deliberately not used: it is still marked
 * experimental in the pinned `@angular/common`, and this service is the seam that makes adopting
 * it later a change inside the page components rather than a rewrite.
 */
@Injectable({ providedIn: 'root' })
export class MirrorApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(QITS_API_BASE);

  /**
   * Every cached repository, with the wire type that says which format it fronts.
   *
   * The type is what makes a row readable at all: `npm-proxy`, `maven-proxy` and `oci-mirror` are
   * the three the service registers, and each carries its own eviction window.
   */
  async repositories(): Promise<readonly MirrorRepositoryDto[]> {
    const response = await firstValueFrom(
      this.http.get<RepositoriesResponse>(`${this.base}/mirror/api/repositories`),
    );
    return response.repositories;
  }

  async packages(repository: string): Promise<RepositoryPackagesResponse> {
    return firstValueFrom(
      this.http.get<RepositoryPackagesResponse>(
        `${this.base}/mirror/api/repositories/${encodeURIComponent(repository)}/packages`,
      ),
    );
  }
}
