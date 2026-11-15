/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Path of the optional account API (e.g. "/api/v1/"). Unset: no account features (GitHub Pages). */
  readonly VITE_SYNC_API?: string;
}
