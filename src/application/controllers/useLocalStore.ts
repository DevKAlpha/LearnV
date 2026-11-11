import { useSyncExternalStore } from "react";
import type { LocalStore } from "@/infrastructure/storage/local-store";

/** Subscribes a component to a shared, validated local store. */
export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
