"use client";

import { useSyncExternalStore } from "react";
import { getSessionDisplayName, getSessionUsername, subscribeSession } from "@/lib/session";

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
  return useSyncExternalStore(subscribeSession, getSessionDisplayName, () => "");
}

export function useSessionUsername() {
  return useSyncExternalStore(subscribeSession, getSessionUsername, () => "");
}
