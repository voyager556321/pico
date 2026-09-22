import type { SimReport, SimTaskResult } from "@/domain/workflow/simulate";

export type LiveStatus = SimTaskResult["boardStatus"];

export type LiveEntrant = {
  id: string;
  mark: string;
};

export type LiveCard = {
  id: string;
  title: string;
  kind: "PAID" | "PRACTICE";
  budget: number;
  requiredRating: number;
  reviewerCount: number;
  status: LiveStatus;
  eligible: number;
  entrants: LiveEntrant[];
  line: string;
  pulseId: string | null;
};

export type LiveStep = {
  delay: number;
  log: string;
  round: number;
  cards: LiveCard[];
  ratings: { id: string; rating: number; level: number }[];
};

function cloneCards(cards: LiveCard[]): LiveCard[] {
  return cards.map((card) => ({
    ...card,
    entrants: card.entrants.map((entrant) => ({ ...entrant })),
  }));
}

function freshCard(task: SimTaskResult): LiveCard {
  return {
    id: task.id,
    title: task.title,
    kind: task.kind,
    budget: task.budget,
    requiredRating: task.requiredRating,
    reviewerCount: task.reviewerCount,
    status: "Qualifying",
    eligible: task.eligible,
    entrants: [],
    line: "Open — waiting for clicks",
    pulseId: null,
  };
}

function markOf(assignment: string): string {
  if (assignment === "SOLVED") return "solved";
  if (assignment === "OUT" || assignment === "INCOMPLETE") return "out";
  if (assignment === "—") return "in";
  return assignment.toLowerCase();
}

export function buildPlayback(report: SimReport): LiveStep[] {
  const steps: LiveStep[] = [];
  const byId = new Map<string, LiveCard>();
  let shownRatings: LiveStep["ratings"] = [];

  function push(delay: number, log: string, round: number) {
    steps.push({
      delay,
      log,
      round,
      cards: cloneCards([...byId.values()]),
      ratings: shownRatings.map((bot) => ({ ...bot })),
    });
  }

  for (const round of report.rounds) {
    for (const task of round.tasks) {
      byId.set(task.id, freshCard(task));
    }
    push(700, `Round ${round.index} — tasks are open`, round.index);

    const cursor = round.tasks.map(() => 0);
    let moved = true;
    while (moved) {
      moved = false;
      for (let i = 0; i < round.tasks.length; i++) {
        const task = round.tasks[i];
        const click = task.clicks[cursor[i]];
        if (!click) continue;
        cursor[i] += 1;
        moved = true;
        const card = byId.get(task.id);
        if (!card) continue;
        card.entrants = [...card.entrants, { id: click.id, mark: "in" }];
        card.pulseId = click.id;
        card.line = `${click.id} entered · ${card.entrants.length}/${task.eligible}`;
        for (const other of byId.values()) {
          if (other.id !== card.id) other.pulseId = null;
        }
        push(520, card.line, round.index);
      }
    }

    for (const task of round.tasks) {
      const card = byId.get(task.id);
      if (!card) continue;
      card.pulseId = null;
      card.entrants = task.clicks.map((click) => ({
        id: click.id,
        mark: markOf(click.assignment),
      }));
      if (task.ghosted) {
        card.status = "HiringSlot";
        card.line =
          task.notes.find((note) => note.includes("зник")) ??
          "Worker dropped — hiring the next seat";
        push(880, card.line, round.index);
      }
      card.status = task.boardStatus;
      card.line = task.notes[task.notes.length - 1] ?? card.line;
      push(760, `${task.title}: ${card.line}`, round.index);
    }

    shownRatings = round.ratings;
    const leader = round.ratings[0];
    push(
      640,
      leader
        ? `Round ${round.index} ratings · lead ${leader.id} ${leader.rating}`
        : `Round ${round.index} done`,
      round.index
    );
  }

  return steps;
}
