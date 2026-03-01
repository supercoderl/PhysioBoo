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

export function generateUUID(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return (
    hex.substring(0, 8) + '-' +
    hex.substring(8, 12) + '-' +
    hex.substring(12, 16) + '-' +
    hex.substring(16, 20) + '-' +
    hex.substring(20)
  );
}

export function convertEnumToSelection(enumVal: any): { label: string, value: any }[] {
  return Object.keys(enumVal).filter(key => isNaN(Number(key))).map(key => ({
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    value: enumVal[key]
  }))
}