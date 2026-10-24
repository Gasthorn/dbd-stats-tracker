import type { AsyncStatus } from "../../../shared/types/common.types";
import type {
  Collectible,
  QuestDifficulty,
  QuestEventOutcome,
  QuestRole,
} from "../../../shared/lib/entity-quest/types";
import type { CreateMatchInput } from "../../match-tracker/types/match.types";
import type { EntityQuestRun } from "../types/entity-quest.types";

/** What just happened, shown once in a result modal and then dismissed. Not persisted. Run ends use the end screen instead. */
export type EntityQuestOutcome =
  | { kind: "start"; combo: Collectible[] }
  /** `choicePending`: the unlock became a pick among several options, shown right after this modal. */
  | { kind: "event"; event: QuestEventOutcome; variant: number; choicePending: boolean }
  | {
      kind: "trial_success";
      shards: number;
      unlock: Collectible | null;
      questCompleted: boolean;
      choicePending: boolean;
    }
  | { kind: "trial_failed"; livesLeft: number };

/** Distributes Omit over the KillerMatch | SurvivorMatch union so each branch keeps its own shape. */
type OmitQuestFields<T> = T extends unknown ? Omit<T, "mode" | "ignoreChallenge"> : never;

export interface RecordQuestTrialInput {
  role: QuestRole;
  match: OmitQuestFields<CreateMatchInput>;
  /** Player's own claim that the active legendary quest was fulfilled during this match. */
  questCompleted: boolean;
  /** When true, the match is logged to history but doesn't affect the run. */
  ignoreChallenge: boolean;
}

export interface EntityQuestState {
  /** undefined = not loaded yet, null = no run in progress for that role. */
  runs: Partial<Record<QuestRole, EntityQuestRun | null>>;
  finishedRuns: EntityQuestRun[];
  status: AsyncStatus;
  error: string | null;
  /** Trial/boss node whose match form is open. */
  pendingTrialNodeId: string | null;
  outcome: EntityQuestOutcome | null;
}

export interface EntityQuestActions {
  loadRole: (role: QuestRole) => Promise<void>;
  loadFinishedRuns: () => Promise<void>;
  startRun: (role: QuestRole, difficulty: QuestDifficulty) => Promise<void>;
  selectNode: (role: QuestRole, nodeId: string) => Promise<void>;
  cancelTrial: () => void;
  recordTrial: (input: RecordQuestTrialInput) => Promise<void>;
  buyOffer: (role: QuestRole, offerIndex: number) => Promise<void>;
  rerollShop: (role: QuestRole) => Promise<void>;
  leaveShop: (role: QuestRole) => Promise<void>;
  pickQuest: (role: QuestRole, questId: string) => Promise<void>;
  /** Resolves the run's pending unlock choice with the named option. */
  pickUnlock: (role: QuestRole, name: string) => Promise<void>;
  abandonRun: (role: QuestRole) => Promise<void>;
  /** Leaves the end screen of a finished run, back to the setup screen. */
  clearFinishedRun: (role: QuestRole) => void;
  dismissOutcome: () => void;
}

export type EntityQuestStore = EntityQuestState & EntityQuestActions;
