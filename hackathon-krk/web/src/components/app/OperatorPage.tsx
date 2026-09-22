"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortPk, skillLabel } from "@/lib/constants";
import { BtnPink, Field, Panel, inputClass } from "@/components/app/ui";
import { DemoControls } from "@/components/app/DemoControls";
import { useAppMode } from "@/components/app/AppChrome";
import {
  assignTeamFromBoard,
  errMsg,
  fillHiringSlot,
  useConfig,
  usePicoProgram,
  useTasks,
} from "@/domain";
import { getTaskCapabilities, toTaskSnapshot } from "@/platform";
import { isDemoTask } from "@/lib/demo";

export function OperatorPage() {
  const { publicKey } = useWallet();
  const [mode] = useAppMode();
  const { program } = usePicoProgram();
  const config = useConfig();
  const { tasks, reload } = useTasks();
  const [taskId, setTaskId] = useState("");
  const [fillWallet, setFillWallet] = useState("");
  const [fillTime, setFillTime] = useState("1000");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const selected = useMemo(
    () => tasks.find((t) => t.publicKey.toBase58() === taskId) ?? null,
    [tasks, taskId]
  );

  const isOperator =
    config && publicKey ? config.operator.equals(publicKey) : false;

  const caps = useMemo(() => {
    if (!selected) {
      return getTaskCapabilities({
        mode,
        wallet: publicKey?.toBase58() ?? null,
        operator: config?.operator.toBase58() ?? null,
      });
    }
    return getTaskCapabilities({
      mode,
      wallet: publicKey?.toBase58() ?? null,
      operator: config?.operator.toBase58() ?? null,
      task: toTaskSnapshot(selected, {
        isDemo: isDemoTask(selected.publicKey),
      }),
    });
  }, [selected, mode, publicKey, config]);

  async function assignFromBoard() {
    if (!program || !publicKey || !selected) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await assignTeamFromBoard({
        program,
        wallet: publicKey,
        task: selected,
        mode,
        role: caps.role,
        isOperator,
      });
      setMsg("Team assigned from qualify podium");
      void reload();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function fillSeat() {
    if (!program || !publicKey || !selected) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await fillHiringSlot({
        program,
        wallet: publicKey,
        task: selected,
        newHolder: fillWallet,
        timeMs: Number(fillTime) || 1,
        mode,
        role: caps.role,
        isOperator,
      });
      setMsg(`Filled slot ${selected.hiringSlot}`);
      void reload();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-accent)]">
          Protocol
        </p>
        <h1 className="app-page-title mt-1.5 text-[2rem] leading-none">
          Operator
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--muted)]">
          Record the off-chain Test 1→2→3 podium on-chain. Single-seat{" "}
          <code className="mono text-xs">fill_slot</code> after declines.
        </p>
        {config ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Operator: {shortPk(config.operator.toBase58(), 6)}
            {isOperator ? " (you)" : ""}
          </p>
        ) : (
          <p className="mt-2 text-xs text-[var(--warn)]">
            Config not found — initialize_config after redeploy.
          </p>
        )}
      </div>

      <DemoControls onChange={() => void reload()} />

      <Panel className="space-y-4">
        <label className="block text-sm font-medium">
          Task
          <select
            className={inputClass}
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
          >
            <option value="">Select…</option>
            {tasks.map((t) => (
              <option key={t.publicKey.toBase58()} value={t.publicKey.toBase58()}>
                {skillLabel(t.skillId)} · {t.status} ·{" "}
                {shortPk(t.publicKey.toBase58())}
              </option>
            ))}
          </select>
        </label>

        {selected ? (
          <p className="text-xs text-[var(--muted)]">
            Status {selected.status} · need {selected.slotCount} seats · hiring
            index {selected.hiringSlot}
          </p>
        ) : null}

        <BtnPink
          loading={busy}
          disabled={!selected || !caps.canAssignTeam}
          onClick={() => void assignFromBoard()}
          className="w-full"
        >
          Assign team from local qualify board
        </BtnPink>
        {caps.blocks.assign_team ? (
          <p className="text-xs text-[var(--muted)]">{caps.blocks.assign_team}</p>
        ) : null}

        {selected?.status === "HiringSlot" ? (
          <div className="space-y-3 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-medium">
              Fill hiring slot #{selected.hiringSlot} (single winner)
            </p>
            <Field
              label="Winner wallet"
              value={fillWallet}
              onChange={setFillWallet}
              placeholder="Base58"
            />
            <Field
              label="Time ms"
              value={fillTime}
              onChange={setFillTime}
              placeholder="1000"
            />
            <BtnPink
              loading={busy}
              disabled={!caps.canFillSlot}
              onClick={() => void fillSeat()}
              className="w-full"
            >
              fill_slot
            </BtnPink>
          </div>
        ) : null}

        {msg ? <p className="text-sm text-[var(--ok)]">{msg}</p> : null}
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      </Panel>

      <p className="text-xs text-[var(--muted)]">
        Platform rules live in <code className="mono">src/platform</code>. See{" "}
        <Link href="/" className="text-[var(--accent)]">
          landing
        </Link>
        .
      </p>
    </div>
  );
}
