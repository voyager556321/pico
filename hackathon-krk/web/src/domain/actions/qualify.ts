import {
  assertAction,
  toTaskSnapshot,
  type AppMode,
  type ActorRole,
} from "@/platform";
import type { TaskAccount } from "@/lib/accounts";
import {
  type QualifyEntry,
  upsertQualifyEntry,
} from "@/lib/offchain";
import { isDemoTask } from "@/lib/demo";

/** Persist a qualify attempt — blocked for clients / hiring by platform. */
export function recordQualifyEntry(opts: {
  task: TaskAccount;
  entry: QualifyEntry;
  mode: AppMode;
  role: ActorRole;
  wallet: string;
}) {
  assertAction({
    action: "qualify",
    mode: opts.mode,
    role: opts.role,
    wallet: opts.wallet,
    task: toTaskSnapshot(opts.task, {
      isDemo: isDemoTask(opts.task.publicKey),
    }),
  });
  return upsertQualifyEntry(opts.task.publicKey.toBase58(), opts.entry);
}
