import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MirrorApi } from './mirror-api';

/**
 * The repositories path and its envelope, asserted once here so the pages' specs can be about
 * rendering.
 *
 * This is a same-origin absolute path on purpose — the SPA is served at `/mirror/` by the very
 * service it reads from, behind the same gateway, and this read carries no credential at all.
 *
 * **The backend is being built against this contract in parallel, so this file is where the
 * contract is pinned**: a path or an envelope that changes shape breaks here first, loudly, rather
 * than at runtime.
 */
describe('MirrorApi', () => {
  let api: MirrorApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(MirrorApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps the cached repositories, name and type and all', async () => {
    const repositories = api.repositories();
    http.expectOne('/mirror/api/repositories').flush({
      repositories: [
        { name: 'npmjs', type: 'npm-proxy' },
        { name: 'maven', type: 'maven-proxy' },
        { name: 'docker.io', type: 'oci-mirror' },
      ],
    });
    await expect(repositories).resolves.toMatchObject([
      { name: 'npmjs', type: 'npm-proxy' },
      { name: 'maven', type: 'maven-proxy' },
      { name: 'docker.io', type: 'oci-mirror' },
    ]);
  });

  it('keeps a field the contract never promised, rather than dropping it', async () => {
    const repositories = api.repositories();
    http.expectOne('/mirror/api/repositories').flush({
      repositories: [{ name: 'npmjs', type: 'npm-proxy', itemCount: 710, sizeBytes: null }],
    });
    const [row] = await repositories;
    expect(row['itemCount']).toBe(710);
    expect(row['sizeBytes']).toBeNull();
  });

  it('reports a failed read as the failure it is, never as an empty list', async () => {
    const repositories = api.repositories();
    http
      .expectOne('/mirror/api/repositories')
      .flush(
        { message: 'the database is unreachable' },
        { status: 503, statusText: 'Unavailable' },
      );
    await expect(repositories).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  it('reports a read that never reached the service', async () => {
    const repositories = api.repositories();
    http.expectOne('/mirror/api/repositories').error(new ProgressEvent('error'), { status: 0 });
    await expect(repositories).rejects.toMatchObject({ status: 0 });
  });
});
