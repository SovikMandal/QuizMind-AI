import { lazy, ComponentType } from "react";

/**
 * Like React.lazy, but resilient to stale chunk errors after a new deploy.
 *
 * When a new build is deployed, the old index.html cached in the browser
 * references chunk filenames that no longer exist. Navigating to a lazy route
 * then throws "Failed to fetch dynamically imported module". We recover by
 * forcing a one-time full reload (which fetches the fresh index.html + chunks).
 */
export function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const KEY = "chunk-reload-attempt";
    try {
      const mod = await factory();
      // Success — clear any prior reload flag.
      sessionStorage.removeItem(KEY);
      return mod;
    } catch (err) {
      // Only reload once to avoid infinite loops if the failure is genuine.
      const alreadyReloaded = sessionStorage.getItem(KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
        // Return a never-resolving promise; the reload takes over.
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
