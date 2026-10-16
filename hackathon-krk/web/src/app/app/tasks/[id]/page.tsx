"use client";

import Link from "next/link";
import { TaskDetailPage as OnChainTaskDetailPage } from "@/components/app/TaskDetailPage";
import {
  Card, CardHeader, Pill, Pbtn, Callout, Timeline, FileList, Messages,
  Empty, ProgressRail,
} from "@/components/ui";
import {
  IconLock, IconSparkle, IconTool, IconFile, IconCheck, IconAlert, IconX,
  IconChat, IconUser, IconArrow,
} from "@/components/icons";
import { TASKS } from "@/lib/mockdata";
import { STATUS_LABELS, fmt, type Task, type TaskStatus } from "@/lib/types";

const STATUS_RAIL: Record<TaskStatus, [string, string, string][]> = {
  draft: [["Draft", "Not published", "cur"]],
  finding: [["Funded", "Funds locked", "done"], ["Worker test", "Running now", "cur"], ["Assigned", "Best passing result", "todo"], ["Submitted", "After assignment", "todo"], ["Paid", "On accept", "todo"]],
  assigned: [["Funded", "Funds locked", "done"], ["Assigned", "Worker assigned", "done"], ["In progress", "Worker started", "cur"], ["Submitted", "Then your review", "todo"], ["Paid", "On accept", "todo"]],
  progress: [["Funded", "", "done"], ["Assigned", "", "done"], ["In progress", "Due soon", "cur"], ["Submitted", "Then your review", "todo"], ["Paid", "On accept", "todo"]],
  submitted: [["Funded", "", "done"], ["Assigned", "", "done"], ["Submitted", "", "done"], ["Review", "Awaiting review", "cur"], ["Paid", "On accept", "todo"]],
  review: [["Funded", "", "done"], ["Assigned", "", "done"], ["Submitted", "", "done"], ["Review", "Awaiting your review", "cur"], ["Paid", "On accept", "todo"]],
  verification: [["Funded", "", "done"], ["Assigned", "", "done"], ["Submitted", "", "done"], ["Verification", "Reviewer checking", "cur"], ["Paid", "Automatic on PASS", "todo"]],
  revision: [["Funded", "", "done"], ["Assigned", "", "done"], ["Submitted", "", "done"], ["Revision", "Resubmit pending", "cur rev"], ["Paid", "On accept", "todo"]],
  dispute: [["Funded", "", "done"], ["Assigned", "", "done"], ["Submitted", "", "done"], ["Dispute", "Your move", "cur err"], ["Decision", "Independent reviewer", "todo"]],
  completed: [["Funded", "", "done"], ["Assigned", "", "done"], ["Submitted", "", "done"], ["Accepted", "", "done"], ["Paid", "", "done"]],
  cancelled: [["Funded", "", "done"], ["Worker test", "0 passed", "done"], ["Cancelled", "", "cur"], ["Refunded", "To Available", "done"]],
};

function escNote(t: Task): string {
  return {
    finding: "Released when you accept",
    assigned: "Released when you accept",
    progress: "Released when you accept",
    submitted: "Released on accept",
    review: "Released on accept",
    verification: "Released on PASS",
    revision: "Released when you accept",
    dispute: "Locked until a decision",
    completed: `Paid to Worker #${t.worker}`,
    cancelled: "Returned to Available",
    draft: "Not locked yet",
  }[t.status];
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = TASKS[id];
  if (!task) return <OnChainTaskDetailPage />;

  const amt = fmt(task.reward);
  const st = STATUS_LABELS[task.status];
  const rail = STATUS_RAIL[task.status];
  const worker = task.worker ? `Worker #${task.worker}` : "Not assigned yet";
  const due = task.due ? `Due ${task.due}` : task.submitted ? `Submitted ${task.submitted}` : task.paid ? `Paid ${task.paid}` : task.cancelled ? `Cancelled ${task.cancelled}` : "—";

  return (
    <div className="proto-stack">
      <Link href="/app/tasks" className="back">← My tasks</Link>

      <div className="hero">
        <div className="htop">
          <div className="hl">
            <div className="row2">
              <Pill tone={(st[1] || "") as any} dot>{st[0]}</Pill>
              <Pill>{task.cat}</Pill>
            </div>
            <h1 className="h1">{task.title}</h1>
            <div className="meta">
              <div><b>{worker}</b><small>{task.worker ? "Assigned worker" : "Worker"}</small></div>
              <div><b>{due}</b><small>Deadline</small></div>
              <div><b>{task.iv ? "Independent · 1 reviewer" : "Standard · by you"}</b><small>Review</small></div>
            </div>
          </div>
          <div className="esc">
            {task.status === "completed" ? (
              <Pill tone="success">Paid out</Pill>
            ) : task.status === "cancelled" ? (
              <Pill>Refunded</Pill>
            ) : task.status === "dispute" ? (
              <Pill tone="error">Locked · in dispute</Pill>
            ) : (
              <Pill tone="success" dot>Locked in escrow</Pill>
            )}
            <div className="amt">{amt}<small>USDC</small></div>
            <div className="note">{escNote(task)}</div>
          </div>
        </div>
        <ProgressRail steps={rail} />
      </div>

      <nav className="proto-room-tabs" aria-label="Workroom sections">
        <Link href={`/app/tasks/${task.id}/room/review`}>Review</Link>
        <Link href={`/app/tasks/${task.id}/room/conversation`}>Conversation{task.unread ? ` · ${task.unread}` : ""}</Link>
        <Link href={`/app/tasks/${task.id}/room/files`}>Files &amp; links</Link>
        <Link href={`/app/tasks/${task.id}/room/activity`}>Activity</Link>
      </nav>

      {task.status === "review" && (
        <Card className="warn">
          <CardHeader icon="alert" title="Work submitted — your review" siCls="warn" />
          <p className="sub2">
            Review the submission against your criteria. <b>Accept</b> &rarr; {amt} USDC is paid to Worker #{task.worker}. <b>Request changes</b> &rarr; {amt} USDC stays locked until the worker resubmits.
          </p>
          <div className="row2">
            <Pbtn variant="p" icon="check">Accept and pay {amt} USDC</Pbtn>
            <Pbtn variant="s" icon="alert">Request changes</Pbtn>
            <Pbtn variant="g" icon="chat">Reply to 2 messages</Pbtn>
          </div>
        </Card>
      )}

      {task.status === "finding" && (
        <>
          <Card>
            <CardHeader icon="sparkle" title="Worker test" right={<Pill tone="accent" dot>Running</Pill>} />
            <p className="sub2 muted">Pico sent the test to eligible {task.cat} workers. Results are graded against your criteria.</p>
            <div className="stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              <div className="stat"><div className="v">{task.cands?.length || 6}</div><b>Invited</b><small>Match category and level</small></div>
              <div className="stat"><div className="v" style={{ color: "var(--text-accent)" }}>2</div><b>Taking the test</b><small>No time limit</small></div>
              <div className="stat"><div className="v" style={{ color: "var(--status-success)" }}>0</div><b>Passed</b><small>Score above the bar</small></div>
              <div className="stat"><div className="v" style={{ color: "var(--text-muted)" }}>2</div><b>Didn&apos;t pass</b><small>Not shown to you</small></div>
            </div>
            <Callout>Nothing to do now. When the test closes, Pico assigns the best passing result. Your {amt} USDC stays locked; tests are never paid from it.</Callout>
          </Card>
          {task.cands && task.cands.some((c) => c.st === "passed") && (
            <Card>
              <CardHeader icon="user" title="Candidates who passed" right={<Pill tone="success">{task.cands!.filter((c) => c.st === "passed").length} passed</Pill>} />
              <div className="lst">
                {task.cands.filter((c) => c.st === "passed").map((c) => (
                  <div key={c.id} className="li click">
                    <span className="av">{c.id.slice(0, 2)}</span>
                    <div className="tx"><b>Worker #{c.id}</b><small>{c.lvl} · {task.cat} · passed {c.t}</small></div>
                    <Pill tone="success" dot>{c.score}/100</Pill>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {task.status === "progress" && (
        <Card className="accent">
          <CardHeader icon="tool" title={`Worker #${task.worker} is on it · due ${task.due}`} />
          <p className="sub2">Nothing to do now. You&apos;ll review the work when it&apos;s submitted. Chat is for questions; new scope goes through a change request the worker accepts.</p>
          {task.unread ? <div className="row2"><Pbtn variant="s" icon="chat">Reply to {task.unread} messages</Pbtn></div> : null}
        </Card>
      )}

      {task.status === "verification" && (
        <Card className="tech">
          <CardHeader icon="sparkle" title="Independent reviewer is checking" siCls="tech" />
          <p className="sub2">1 reviewer checks the submission against your criteria. <b>PASS</b> &rarr; {amt} USDC is paid to Worker #{task.worker} automatically. <b>FAIL</b> &rarr; you decide.</p>
        </Card>
      )}

      {task.status === "revision" && (
        <Card className="rev">
          <CardHeader icon="alert" title={`Worker is revising · resubmit by ${task.due}`} siCls="rev" />
          <p className="sub2">You requested changes on criterion {task.req ? task.req.crit + 1 : 2}. You&apos;ll review again when the worker resubmits. {amt} USDC stays locked.</p>
        </Card>
      )}

      {task.status === "dispute" && task.dsp && (
        <>
          <Card className="err">
            <CardHeader icon="alert" title="Worker replied — your move" siCls="err" right={<Pill tone="error">Reply by {task.dsp.decideBy}</Pill>} />
            <p className="sub2">Reply or add evidence. An independent reviewer decides after both sides answer. {amt} USDC stays locked until the decision.</p>
            <div className="row2">
              <Pbtn variant="p">Reply in dispute</Pbtn>
              <Pbtn variant="s">Add evidence</Pbtn>
            </div>
          </Card>
          <Card>
            <CardHeader icon="lock" title="Criterion in dispute" />
            <div className="li">
              <span className="num">{task.dsp.crit + 1}</span>
              <div className="tx"><b style={{ fontWeight: 500 }}>{task.crit[task.dsp.crit]}</b></div>
              <Pill tone="error">In dispute</Pill>
            </div>
            <div className="two">
              <div className="quote"><b>Your claim</b>{task.dsp.claim}</div>
              <div className="quote"><b>Worker #{task.worker}</b>{task.dsp.pos}</div>
            </div>
          </Card>
          {task.dsp.evidence.length > 0 && (
            <Card>
              <CardHeader icon="file" title="Evidence" right={<Pbtn variant="g" size="sm" icon="plus">Add evidence</Pbtn>} />
              <FileList files={task.dsp.evidence} />
            </Card>
          )}
        </>
      )}

      {task.status === "completed" && (
        <>
          <Card className="ok">
            <CardHeader icon="check" title={`Paid · ${amt} USDC to Worker #${task.worker}`} siCls="ok" right={<Pbtn variant="g" size="sm">Proof {task.proof} ↗</Pbtn>} />
            <p className="sub2">All criteria met. The payment settled on Solana.</p>
          </Card>
          {task.files && task.files.length > 0 && (
            <Card>
              <CardHeader icon="file" title="Delivered files" />
              <FileList files={task.files} />
            </Card>
          )}
        </>
      )}

      {task.status === "cancelled" && (
        <Card>
          <CardHeader icon="x" title={`Cancelled · ${amt} USDC returned to Available`} right={<Pbtn variant="g" size="sm">Proof {task.proof} ↗</Pbtn>} />
          <p className="sub2">Nobody passed the test. You cancelled before assignment, so the full amount went back to Available.</p>
          <div className="row2"><Pbtn variant="s" icon="arrow">Create a similar task</Pbtn></div>
        </Card>
      )}

      {task.sub && (
        <Card>
          <CardHeader icon="tasks" title="Submission" right={<Pill>Submitted {task.sub.at}</Pill>} />
          <p className="sub2 muted">{task.sub.note}</p>
          <FileList files={task.sub.files} />
        </Card>
      )}

      {task.chat && task.chat.length > 0 && task.status !== "dispute" && (
        <Card id="chat">
          <CardHeader icon="chat" title={`Conversation${task.unread ? ` · ${task.unread} new` : ""}`} />
          {task.status === "progress" && <Callout>Chat is context only. It can&apos;t add requirements.</Callout>}
          <Messages list={task.chat} who={`Worker #${task.worker}`} />
          <div className="composer">
            <div className="mfield"><input placeholder={`Write to Worker #${task.worker}…`} /></div>
            <Pbtn variant="s">Send</Pbtn>
          </div>
        </Card>
      )}

      {task.status === "dispute" && task.chat && (
        <Card id="chat">
          <CardHeader icon="chat" title="Dispute thread" />
          <Callout>Both sides and the independent reviewer see this thread.</Callout>
          <Messages list={task.chat} who={`Worker #${task.worker}`} />
          <div className="composer">
            <div className="mfield"><input placeholder="Reply with facts about the criterion…" /></div>
            <Pbtn variant="p">Send reply</Pbtn>
          </div>
        </Card>
      )}

      {task.files && task.files.length > 0 && task.status !== "completed" && (
        <Card>
          <CardHeader icon="file" title="Files & links" right={<Pbtn variant="g" size="sm" icon="plus">Add link</Pbtn>} />
          <FileList files={task.files} />
        </Card>
      )}

      <Card>
        <CardHeader
          icon="lock"
          title={task.status === "completed" ? "Acceptance criteria" : "Task description"}
          right={
            task.status === "finding" ? <Pill>Locks at assignment</Pill> :
            task.status === "completed" ? <Pill tone="success">All met</Pill> :
            <Pill>Locked</Pill>
          }
        />
        <p className="sub2">{task.desc}</p>
        <div className="lst">
          {task.crit.map((c, i) => {
            const notMet = task.notMet?.includes(i);
            const inDispute = task.dsp?.crit === i;
            return (
              <div key={i} className="li">
                <span className="num">{i + 1}</span>
                <div className="tx"><b style={{ fontWeight: 500 }}>{c}</b></div>
                {task.status === "completed" ? <Pill tone="success">Met</Pill> :
                  notMet ? <Pill tone="rev">Not met</Pill> :
                  inDispute ? <Pill tone="error">In dispute</Pill> :
                  <span className="lk"><IconLock size={14} /></span>}
              </div>
            );
          })}
        </div>
      </Card>

      {task.events.length > 0 && (
        <Card>
          <CardHeader icon="activity" title="Task activity" />
          <Timeline events={task.events} />
        </Card>
      )}

      {task.status === "finding" && (
        <Card className="dash">
          <CardHeader title="Cancel this task" />
          <p className="sub2 muted">Only possible before a worker is assigned. {amt} USDC goes back to Available.</p>
          <div><Pbtn variant="d" size="sm">Cancel task and unlock {amt} USDC</Pbtn></div>
        </Card>
      )}
    </div>
  );
}