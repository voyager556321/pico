"use client";

import { useCallback, useEffect, useState } from "react";
import type { Program } from "@coral-xyz/anchor";
import type { PublicKey } from "@solana/web3.js";
import type { ConfigAccount, TaskAccount } from "@/lib/program";
import {
  getDemoTask,
  isDemoEnabled,
  mergeWithDemo,
} from "@/lib/demo";

export function usePicoProgram(): {
  program: Program | null;
  connected: boolean;
  publicKey: PublicKey | null;
} {
  return {
    program: null,
    connected: false,
    publicKey: null,
  };
}

export function useTasks(refreshKey = 0) {
  const [tasks, setTasks] = useState<TaskAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoTick, setDemoTick] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let rows: TaskAccount[] = [];
      rows = mergeWithDemo(rows);
      rows.sort((a, b) => b.taskNonce.cmp(a.taskNonce));
      setTasks(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setTasks(mergeWithDemo([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey, demoTick]);

  const bumpDemo = useCallback(() => setDemoTick((n) => n + 1), []);

  return { tasks, loading, error, reload, bumpDemo };
}

export function useTask(taskId: string | undefined, refreshKey = 0) {
  const [task, setTask] = useState<TaskAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoTick, setDemoTick] = useState(0);

  const reload = useCallback(async () => {
    if (!taskId) {
      setTask(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const demo = getDemoTask(taskId);
      if (demo) {
        setTask(demo);
        setLoading(false);
        return;
      }
      setTask(null);
      setError(
        isDemoEnabled()
          ? "Task not found in local demo data. Fiat-backed task loading is not available yet."
          : "Task loading is temporarily unavailable while fiat payments are being integrated."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey, demoTick]);

  const bumpDemo = useCallback(() => setDemoTick((n) => n + 1), []);

  return { task, loading, error, reload, bumpDemo };
}

export function useConfig(): ConfigAccount | null {
  return null;
}

export function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
