"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  ConfigAccount,
  TaskAccount,
  fetchAllTasks,
  fetchConfig,
  fetchTaskByKey,
  getPicoProgram,
} from "@/lib/program";
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
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    try {
      return getPicoProgram(connection, wallet as never);
    } catch {
      return null;
    }
  }, [connection, wallet, wallet.publicKey, wallet.signTransaction]);

  return {
    program,
    connected: Boolean(wallet.publicKey),
    publicKey: wallet.publicKey,
  };
}

export function useTasks(refreshKey = 0) {
  const { program } = usePicoProgram();
  const [tasks, setTasks] = useState<TaskAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoTick, setDemoTick] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let rows: TaskAccount[] = [];
      if (program) {
        try {
          rows = await fetchAllTasks(program);
        } catch (e) {
          if (!isDemoEnabled()) throw e;
          setError(e instanceof Error ? e.message : String(e));
        }
      }
      rows = mergeWithDemo(rows);
      rows.sort((a, b) => b.taskNonce.cmp(a.taskNonce));
      setTasks(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setTasks(mergeWithDemo([]));
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey, demoTick]);

  const bumpDemo = useCallback(() => setDemoTick((n) => n + 1), []);

  return { tasks, loading, error, reload, bumpDemo };
}

export function useTask(taskId: string | undefined, refreshKey = 0) {
  const { program } = usePicoProgram();
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
      if (!program) {
        setTask(null);
        setError(
          isDemoEnabled()
            ? "Task not found (seed a demo task or connect wallet)"
            : "Connect wallet"
        );
        return;
      }
      const key = new PublicKey(taskId);
      const row = await fetchTaskByKey(program, key);
      setTask(row);
      if (!row) setError("Task not found on-chain (redeploy / wrong network?)");
    } catch (e) {
      const demo = getDemoTask(taskId);
      if (demo) {
        setTask(demo);
      } else {
        setError(e instanceof Error ? e.message : String(e));
        setTask(null);
      }
    } finally {
      setLoading(false);
    }
  }, [program, taskId]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey, demoTick]);

  const bumpDemo = useCallback(() => setDemoTick((n) => n + 1), []);

  return { task, loading, error, reload, bumpDemo };
}

export function useConfig(refreshKey = 0) {
  const { program } = usePicoProgram();
  const [config, setConfig] = useState<ConfigAccount | null>(null);

  useEffect(() => {
    if (!program) {
      setConfig(null);
      return;
    }
    void fetchConfig(program).then(setConfig);
  }, [program, refreshKey]);

  return config;
}

export function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
