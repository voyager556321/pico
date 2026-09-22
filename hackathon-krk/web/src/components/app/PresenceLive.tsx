"use client";

import { useEffect } from "react";
import {
  PRESENCE_EVENT,
  loadActiveSession,
  loadWorkSession,
  tickPresence,
  type PresenceSource,
} from "@/lib/presence";

/**
 * Keeps the executor's clock running after the work page opens.
 * A focused work tab counts as present. A fresh editor heartbeat counts
 * even when the browser is in the background.
 */
export function PresenceLive({ pathname }: { pathname: string }) {
  useEffect(() => {
    let editorFresh = false;
    let editorTask = "";
    let editorWallet = "";

    function noteEditor(data: { taskId?: string; wallet?: string }) {
      if (!data.taskId || !data.wallet) return;
      editorTask = data.taskId;
      editorWallet = data.wallet;
      editorFresh = true;
    }

    const channel = new BroadcastChannel("pico-presence");
    channel.onmessage = (event) => {
      const data = event.data as { type?: string; taskId?: string; wallet?: string };
      if (data?.type === "pico-presence") noteEditor(data);
    };
    const onWindow = (event: MessageEvent) => {
      const data = event.data as { type?: string; taskId?: string; wallet?: string };
      if (data?.type === "pico-presence") noteEditor(data);
    };
    window.addEventListener("message", onWindow);

    const timer = window.setInterval(() => {
      const active = loadActiveSession();
      if (!active) return;
      const session = loadWorkSession(active.taskId, active.wallet);
      if (!session) return;

      const onWork =
        pathname === `/app/tasks/${active.taskId}/work` &&
        document.visibilityState === "visible";
      const fromEditor =
        editorFresh && editorTask === active.taskId && editorWallet === active.wallet;
      const source: PresenceSource = fromEditor ? "editor" : "web";
      tickPresence(session, onWork || fromEditor, source);
      editorFresh = false;
      window.dispatchEvent(new Event(PRESENCE_EVENT));

      void fetch(
        `/api/presence?taskId=${encodeURIComponent(active.taskId)}&wallet=${encodeURIComponent(active.wallet)}`
      )
        .then((response) => response.json())
        .then((data: { fresh?: boolean }) => {
          if (!data.fresh) return;
          editorTask = active.taskId;
          editorWallet = active.wallet;
          editorFresh = true;
        })
        .catch(() => {
          /* local demo still runs without the route */
        });
    }, 1000);

    return () => {
      window.clearInterval(timer);
      channel.close();
      window.removeEventListener("message", onWindow);
    };
  }, [pathname]);

  return null;
}
