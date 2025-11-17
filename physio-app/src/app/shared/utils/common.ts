import { defer, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

export function hardReload$() {
  return defer(() =>
    of(null).pipe(
      tap(() => {
        localStorage.clear();
        sessionStorage.clear();
      }),

      switchMap(() =>
        from(
          (async () => {
            if ('indexedDB' in window && indexedDB.databases) {
              const dbs = await indexedDB.databases();
              for (const db of dbs) {
                indexedDB.deleteDatabase(db.name!);
              }
            }
          })()
        )
      ),

      switchMap(() =>
        from(
          (async () => {
            if ('caches' in window) {
              const names = await caches.keys();
              for (const name of names) {
                await caches.delete(name);
              }
            }
          })()
        )
      ),

      switchMap(() =>
        from(
          (async () => {
            if ('serviceWorker' in navigator) {
              const regs = await navigator.serviceWorker.getRegistrations();
              for (const reg of regs) reg.unregister();
            }
          })()
        )
      )
    )
  );
}
