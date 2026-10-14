"use client";

import { useSyncExternalStore } from "react";
import {
  getSessionDisplayName,
  getSessionUser,
  getSessionUsername,
  subscribeSession,
  type SessionUser,
} from "@/lib/session";

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

const SERVER_USER: SessionUser | null = null;

export function useSessionUser() {
  return useSyncExternalStore(subscribeSession, getSessionUser, () => SERVER_USER);
}
