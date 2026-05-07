import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { AppState, Platform } from "react-native";

import { usePreferenceStore } from "@/src/features/preferences/store";

const DISTINCT_ID_KEY = "analytics.distinct_id";
const FLUSH_AT = 20;
const MAX_BATCH_EVENTS = 100;
const MAX_PROPS_BYTES = 4096;
const REQUEST_TIMEOUT_MS = 10_000;

type Properties = Record<string, unknown>;

type QueuedEvent = {
  event: string;
  properties: Properties;
  client_ts: number;
};

let distinctIdPromise: Promise<string> | null = null;
let queue: QueuedEvent[] = [];
let appStateRegistered = false;
let inFlight: Promise<void> | null = null;

function uuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function utf8ByteLength(s: string): number {
  let bytes = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c < 0xdc00) {
      bytes += 4;
      i++;
    } else bytes += 3;
  }
  return bytes;
}

async function ensureDistinctId(): Promise<string> {
  if (!distinctIdPromise) {
    distinctIdPromise = (async () => {
      const existing = await AsyncStorage.getItem(DISTINCT_ID_KEY);
      if (existing) return existing;
      const fresh = uuidV4();
      await AsyncStorage.setItem(DISTINCT_ID_KEY, fresh);
      return fresh;
    })();
  }
  return distinctIdPromise;
}

function ensureLifecycleHook(): void {
  if (appStateRegistered) return;
  appStateRegistered = true;
  AppState.addEventListener("change", (state) => {
    if (state === "background" || state === "inactive") {
      void flush();
    }
  });
}

function isOptedOut(): boolean {
  return usePreferenceStore.getState().analyticsOptedOut;
}

export function track(event: string, properties: Properties = {}): void {
  if (isOptedOut()) return;
  if (utf8ByteLength(JSON.stringify(properties)) > MAX_PROPS_BYTES) {
    if (__DEV__) console.warn(`[analytics] dropping oversized event: ${event}`);
    return;
  }
  ensureLifecycleHook();
  queue.push({ event, properties, client_ts: Date.now() });
  if (queue.length >= FLUSH_AT) {
    void flush();
  }
}

export async function flush(): Promise<void> {
  if (inFlight) return inFlight;
  if (isOptedOut()) {
    queue = [];
    return;
  }
  if (queue.length === 0) return;

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const token = process.env.EXPO_PUBLIC_EVENTS_TOKEN;
  if (!baseUrl || !token) return;

  inFlight = (async () => {
    const distinctId = await ensureDistinctId();
    const drained = queue.splice(0, MAX_BATCH_EVENTS);

    const payload = {
      distinct_id: distinctId,
      app_version: Constants.expoConfig?.version ?? null,
      platform: Platform.OS,
      events: drained,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${baseUrl}/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok && __DEV__) {
        console.warn(`[analytics] flush failed: HTTP ${res.status}`);
      }
    } catch (err) {
      if (__DEV__) console.warn("[analytics] flush error", err);
    } finally {
      clearTimeout(timeout);
    }
  })();

  try {
    await inFlight;
  } finally {
    inFlight = null;
  }
}

export async function getDistinctId(): Promise<string> {
  return ensureDistinctId();
}

export async function resetDistinctId(): Promise<void> {
  distinctIdPromise = null;
  await AsyncStorage.removeItem(DISTINCT_ID_KEY);
}
