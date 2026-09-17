"use client";

import { useSyncExternalStore } from "react";
import { getSessionDisplayName, getSessionUsername } from "@/lib/session";

function subscribeNoop() {
  return () => {};
}

export function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function useSessionDisplayName() {
  return useSyncExternalStore(
    subscribeNoop,
    () => getSessionDisplayName(),
    () => "",
  );
}

export function useSessionUsername() {
  return useSyncExternalStore(
    subscribeNoop,
    () => getSessionUsername(),
    () => "",
  );
}
